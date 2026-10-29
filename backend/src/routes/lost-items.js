import { Router } from 'express'
import { pool } from '../db.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

// เฉพาะเจ้าหน้าที่และแอดมินเท่านั้นที่จัดการของหายได้
const staffOnly = requireRole('officer', 'admin')

// UC_04 ลงทะเบียนของหาย
router.post('/', staffOnly, async (req, res) => {
  const { name, detail, location, found_date } = req.body
  if (!name?.trim() || !location?.trim() || !found_date) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อของ สถานที่พบ และวันที่พบ' })
  }

  // ลงทะเบียนของหายพร้อมสร้างประชาสัมพันธ์อัตโนมัติ (UC_08) ใน transaction เดียวกัน
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `INSERT INTO lost_items (name, detail, location, found_date, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), (detail || '').trim(), location.trim(), found_date, req.user.id]
    )
    const item = rows[0]
    await client.query(
      `INSERT INTO broadcasts (title, description, item_id, created_by)
       VALUES ($1, $2, $3, $4)`,
      [`พบ ${item.name}`, `ที่${item.location}`, item.id, req.user.id]
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

// UC_05 ดูรายการของหายทั้งหมด (ใหม่สุดก่อน)
router.get('/', staffOnly, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM lost_items ORDER BY created_at DESC')
  res.json({ items: rows })
})

export default router
