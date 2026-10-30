import { Router } from 'express'
import { pool } from '../db.js'
import path from 'node:path'
import { requireRole } from '../middleware/auth.js'
import { uploadImage, dropUpload, UPLOAD_ROOT } from '../middleware/upload.js'

const router = Router()

// เฉพาะเจ้าหน้าที่และแอดมินเท่านั้นที่ยืนยันการส่งมอบได้
const staffOnly = requireRole('officer', 'admin')
const evidenceImage = uploadImage('evidence') // รูปหลักฐาน (ไม่บังคับ) ส่งมาเป็น multipart ช่อง image

// ดูรูปหลักฐาน: ตรวจสิทธิ์ก่อน (ไม่ใช้โฟลเดอร์สาธารณะ) ชื่อไฟล์ต้องเป็นรูปแบบที่ระบบสร้างเท่านั้น
router.get('/images/:name', staffOnly, (req, res) => {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(req.params.name)) {
    return res.status(404).json({ error: 'ไม่พบรูปนี้' })
  }
  res.set('X-Content-Type-Options', 'nosniff')
  res.sendFile(path.join(UPLOAD_ROOT, 'evidence', req.params.name), (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'ไม่พบรูปนี้' })
  })
})

// UC_09 ยืนยันการส่งมอบ: บันทึกผู้รับ/ผู้ส่ง/พยาน แล้วตั้งสถานะของเป็น returned
router.post('/', staffOnly, evidenceImage, async (req, res) => {
  const { item_id, receiver_name, receiver_contact, sender_name, witness_name } = req.body
  if (!item_id || !receiver_name?.trim()) {
    dropUpload(req)
    return res.status(400).json({ error: 'กรุณาเลือกของหายและกรอกชื่อผู้รับคืน' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // ล็อกแถวของไว้ กันสองคนกดส่งมอบของชิ้นเดียวกันพร้อมกัน
    const { rows: items } = await client.query('SELECT status FROM lost_items WHERE id = $1 FOR UPDATE', [item_id])
    if (items.length === 0) {
      await client.query('ROLLBACK')
      dropUpload(req)
      return res.status(404).json({ error: 'ไม่พบของหายนี้' })
    }
    if (items[0].status !== 'found') {
      await client.query('ROLLBACK')
      dropUpload(req)
      return res.status(409).json({ error: 'ของชิ้นนี้ไม่อยู่ในสถานะรอรับคืน' })
    }
    const { rows } = await client.query(
      `INSERT INTO returns (item_id, receiver_name, receiver_contact, sender_name, witness_name, proof_image, officer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [item_id, receiver_name.trim(), (receiver_contact || '').trim(), (sender_name || '').trim(), (witness_name || '').trim(), req.file?.filename || null, req.user.id]
    )
    await client.query("UPDATE lost_items SET status = 'returned' WHERE id = $1", [item_id])
    await client.query('COMMIT')
    res.status(201).json({ return: rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    // 22P02 = item_id ไม่ใช่ตัวเลข
    dropUpload(req)
    if (err.code === '22P02') return res.status(400).json({ error: 'รหัสของหายไม่ถูกต้อง' })
    throw err
  } finally {
    client.release()
  }
})

// ดูประวัติการส่งมอบทั้งหมด (ใหม่สุดก่อน) พร้อมชื่อของ เจ้าหน้าที่ และข้อโต้แย้ง (ถ้ามี)
router.get('/', staffOnly, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, i.name AS item_name, i.status AS item_status, u.name AS officer_name,
            d.claimant_name, d.new_detail AS dispute_detail, d.new_evidence_image AS dispute_image, d.created_at AS disputed_at, d.resolution, d.resolved_at
     FROM returns r
     JOIN lost_items i ON i.id = r.item_id
     JOIN users u ON u.id = r.officer_id
     LEFT JOIN disputes d ON d.return_id = r.id
     ORDER BY r.returned_at DESC`
  )
  res.json({ returns: rows })
})

// UC_09 กรณีโต้แย้ง: มีคนอ้างว่าเป็นเจ้าของตัวจริง บันทึกข้อโต้แย้งแล้วตั้งสถานะของเป็น disputed
router.post('/:id/dispute', staffOnly, evidenceImage, async (req, res) => {
  const { claimant_name, new_detail } = req.body
  if (!claimant_name?.trim() || !new_detail?.trim()) {
    dropUpload(req)
    return res.status(400).json({ error: 'กรุณากรอกชื่อผู้โต้แย้งและรายละเอียด' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: found } = await client.query(
      `SELECT r.item_id, i.status FROM returns r JOIN lost_items i ON i.id = r.item_id
       WHERE r.id = $1 FOR UPDATE OF i`,
      [req.params.id]
    )
    if (found.length === 0) {
      await client.query('ROLLBACK')
      dropUpload(req)
      return res.status(404).json({ error: 'ไม่พบรายการส่งมอบนี้' })
    }
    // โต้แย้งได้ครั้งเดียวต่อการส่งมอบ (ปิดข้อโต้แย้งแล้วก็โต้แย้งซ้ำไม่ได้)
    const { rowCount } = await client.query('SELECT 1 FROM disputes WHERE return_id = $1', [req.params.id])
    if (found[0].status !== 'returned' || rowCount > 0) {
      await client.query('ROLLBACK')
      dropUpload(req)
      return res.status(409).json({ error: 'รายการนี้ถูกโต้แย้งไปแล้ว' })
    }
    const { rows } = await client.query(
      `INSERT INTO disputes (return_id, officer_id, claimant_name, new_detail, new_evidence_image)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, req.user.id, claimant_name.trim(), new_detail.trim(), req.file?.filename || null]
    )
    await client.query("UPDATE lost_items SET status = 'disputed' WHERE id = $1", [found[0].item_id])
    await client.query('COMMIT')
    res.status(201).json({ dispute: rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    dropUpload(req)
    if (err.code === '22P02') return res.status(400).json({ error: 'รหัสการส่งมอบไม่ถูกต้อง' })
    throw err
  } finally {
    client.release()
  }
})

// UC_09 ปิดข้อโต้แย้ง: บันทึกผลการเจรจา แล้วตั้งสถานะของกลับเป็น returned (ข้อโต้แย้งเดิมยังเก็บไว้เป็นประวัติ)
router.post('/:id/resolve', staffOnly, async (req, res) => {
  const { resolution } = req.body
  if (!resolution?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกผลการเจรจา' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // ล็อกแถวของไว้ กันสองคนกดปิดข้อโต้แย้งพร้อมกัน
    const { rows: found } = await client.query(
      `SELECT r.item_id, i.status FROM returns r JOIN lost_items i ON i.id = r.item_id
       WHERE r.id = $1 FOR UPDATE OF i`,
      [req.params.id]
    )
    if (found.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'ไม่พบรายการส่งมอบนี้' })
    }
    if (found[0].status !== 'disputed') {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'รายการนี้ไม่มีข้อโต้แย้งที่รอปิด' })
    }
    const { rows } = await client.query(
      `UPDATE disputes SET resolution = $1, resolved_at = now()
       WHERE return_id = $2 AND resolved_at IS NULL RETURNING *`,
      [resolution.trim(), req.params.id]
    )
    await client.query("UPDATE lost_items SET status = 'returned' WHERE id = $1", [found[0].item_id])
    await client.query('COMMIT')
    res.json({ dispute: rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '22P02') return res.status(400).json({ error: 'รหัสการส่งมอบไม่ถูกต้อง' })
    throw err
  } finally {
    client.release()
  }
})

export default router
