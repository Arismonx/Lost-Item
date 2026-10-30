import { Router } from 'express'
import { pool } from '../db.js'
import { requireLogin, requireRole } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

// เฉพาะเจ้าหน้าที่และแอดมินเท่านั้นที่จัดการของหายได้
const staffOnly = requireRole('officer', 'admin')
const itemImage = uploadImage('items') // รูปของหาย (ไม่บังคับ) ส่งมาเป็น multipart ช่อง image

// UC_04 ลงทะเบียนของหาย
router.post('/', staffOnly, itemImage, async (req, res) => {
  const { name, detail, location, found_date } = req.body
  if (!name?.trim() || !location?.trim() || !found_date) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อของ สถานที่พบ และวันที่พบ' })
  }

  // ลงทะเบียนของหายพร้อมสร้างประชาสัมพันธ์อัตโนมัติ (UC_08) ใน transaction เดียวกัน
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `INSERT INTO lost_items (name, detail, location, found_date, image, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name.trim(), (detail || '').trim(), location.trim(), found_date, req.file?.filename || null, req.user.id]
    )
    const item = rows[0]
    await client.query(
      `INSERT INTO broadcasts (title, description, image, item_id, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [`พบ ${item.name}`, `ที่${item.location}`, item.image, item.id, req.user.id]
    )
    await client.query('COMMIT')
    res.status(201).json({ item })
  } catch (err) {
    await client.query('ROLLBACK')
    // 22007/22008 = รูปแบบวันที่ไม่ถูกต้อง
    if (err.code === '22007' || err.code === '22008') {
      return res.status(400).json({ error: 'รูปแบบวันที่ไม่ถูกต้อง' })
    }
    throw err
  } finally {
    client.release()
  }
})

// UC_06 ค้นหาของหาย (ผู้ใช้ที่ล็อกอิน) เห็นเฉพาะของที่ยังรอเจ้าของมารับ ค้นจากชื่อ/สถานที่/รายละเอียด
router.get('/search', requireLogin, async (req, res) => {
  const q = (req.query.q || '').trim()
  const { rows } = await pool.query(
    `SELECT id, name, detail, location, found_date, image FROM lost_items
     WHERE status = 'found' AND ($1 = '' OR name ILIKE $2 OR location ILIKE $2 OR detail ILIKE $2)
     ORDER BY created_at DESC`,
    [q, `%${q}%`]
  )
  res.json({ items: rows })
})

// UC_05 ดูรายการของหายทั้งหมด (ใหม่สุดก่อน)
router.get('/', staffOnly, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM lost_items ORDER BY created_at DESC')
  res.json({ items: rows })
})

// UC_05 แก้ไขของหาย (แก้ได้เฉพาะที่ยังรอรับคืน) แก้ข้อความประชาสัมพันธ์ที่ผูกอยู่ให้ตรงกันด้วย
router.patch('/:id', staffOnly, itemImage, async (req, res) => {
  const { name, detail, location, found_date } = req.body
  if (!name?.trim() || !location?.trim() || !found_date) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อของ สถานที่พบ และวันที่พบ' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const found = await client.query('SELECT status FROM lost_items WHERE id = $1 FOR UPDATE', [req.params.id])
    if (found.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'ไม่พบของหายนี้' })
    }
    if (found.rows[0].status !== 'found') {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'แก้ไขได้เฉพาะของที่ยังรอรับคืน' })
    }
    const { rows } = await client.query(
      `UPDATE lost_items SET name = $1, detail = $2, location = $3, found_date = $4,
         image = COALESCE($5, image)
       WHERE id = $6 RETURNING *`,
      [name.trim(), (detail || '').trim(), location.trim(), found_date, req.file?.filename || null, req.params.id]
    )
    const item = rows[0]
    await client.query(
      'UPDATE broadcasts SET title = $1, description = $2, image = $3 WHERE item_id = $4',
      [`พบ ${item.name}`, `ที่${item.location}`, item.image, item.id]
    )
    await client.query('COMMIT')
    res.json({ item })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '22007' || err.code === '22008') {
      return res.status(400).json({ error: 'รูปแบบวันที่ไม่ถูกต้อง' })
    }
    throw err
  } finally {
    client.release()
  }
})

export default router
