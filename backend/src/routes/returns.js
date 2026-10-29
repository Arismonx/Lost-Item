import { Router } from 'express'
import { pool } from '../db.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

// เฉพาะเจ้าหน้าที่และแอดมินเท่านั้นที่ยืนยันการส่งมอบได้
const staffOnly = requireRole('officer', 'admin')

// UC_09 ยืนยันการส่งมอบ: บันทึกผู้รับ/ผู้ส่ง/พยาน แล้วตั้งสถานะของเป็น returned
router.post('/', staffOnly, async (req, res) => {
  const { item_id, receiver_name, receiver_contact, sender_name, witness_name } = req.body
  if (!item_id || !receiver_name?.trim()) {
    return res.status(400).json({ error: 'กรุณาเลือกของหายและกรอกชื่อผู้รับคืน' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // ล็อกแถวของไว้ กันสองคนกดส่งมอบของชิ้นเดียวกันพร้อมกัน
    const { rows: items } = await client.query('SELECT status FROM lost_items WHERE id = $1 FOR UPDATE', [item_id])
    if (items.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'ไม่พบของหายนี้' })
    }
    if (items[0].status !== 'found') {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'ของชิ้นนี้ไม่อยู่ในสถานะรอรับคืน' })
    }
    const { rows } = await client.query(
      `INSERT INTO returns (item_id, receiver_name, receiver_contact, sender_name, witness_name, officer_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [item_id, receiver_name.trim(), (receiver_contact || '').trim(), (sender_name || '').trim(), (witness_name || '').trim(), req.user.id]
    )
    await client.query("UPDATE lost_items SET status = 'returned' WHERE id = $1", [item_id])
    await client.query('COMMIT')
    res.status(201).json({ return: rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    // 22P02 = item_id ไม่ใช่ตัวเลข
    if (err.code === '22P02') return res.status(400).json({ error: 'รหัสของหายไม่ถูกต้อง' })
    throw err
  } finally {
    client.release()
  }
})

// ดูประวัติการส่งมอบทั้งหมด (ใหม่สุดก่อน) พร้อมชื่อของและเจ้าหน้าที่
router.get('/', staffOnly, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, i.name AS item_name, i.status AS item_status, u.name AS officer_name
     FROM returns r
     JOIN lost_items i ON i.id = r.item_id
     JOIN users u ON u.id = r.officer_id
     ORDER BY r.returned_at DESC`
  )
  res.json({ returns: rows })
})

// UC_09 กรณีโต้แย้ง: มีคนอ้างว่าเป็นเจ้าของตัวจริง บันทึกข้อโต้แย้งแล้วตั้งสถานะของเป็น disputed
router.post('/:id/dispute', staffOnly, async (req, res) => {
  const { claimant_name, new_detail } = req.body
  if (!claimant_name?.trim() || !new_detail?.trim()) {
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
      return res.status(404).json({ error: 'ไม่พบรายการส่งมอบนี้' })
    }
    if (found[0].status !== 'returned') {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'รายการนี้ถูกโต้แย้งไปแล้ว' })
    }
    const { rows } = await client.query(
      `INSERT INTO disputes (return_id, officer_id, claimant_name, new_detail)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.user.id, claimant_name.trim(), new_detail.trim()]
    )
    await client.query("UPDATE lost_items SET status = 'disputed' WHERE id = $1", [found[0].item_id])
    await client.query('COMMIT')
    res.status(201).json({ dispute: rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '22P02') return res.status(400).json({ error: 'รหัสการส่งมอบไม่ถูกต้อง' })
    throw err
  } finally {
    client.release()
  }
})

export default router
