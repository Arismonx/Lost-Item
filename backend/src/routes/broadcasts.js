import { Router } from 'express'
import { pool } from '../db.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

// UC_08 ดูประชาสัมพันธ์ (ทุกคนดูได้ ไม่ต้องล็อกอิน) ใหม่สุดก่อน
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM broadcasts ORDER BY created_at DESC')
  res.json({ broadcasts: rows })
})

// UC_08 ส่งประชาสัมพันธ์ (เฉพาะเจ้าหน้าที่/แอดมิน)
router.post('/', requireRole('officer', 'admin'), async (req, res) => {
  const { title, description, item_id } = req.body
  if (!title?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกหัวข้อ' })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO broadcasts (title, description, item_id, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title.trim(), (description || '').trim(), item_id || null, req.user.id]
    )
    res.status(201).json({ broadcast: rows[0] })
  } catch (err) {
    // 23503 = item_id ไม่มีอยู่จริง, 22P02 = item_id ไม่ใช่ตัวเลข
    if (err.code === '23503' || err.code === '22P02') {
      return res.status(400).json({ error: 'ไม่พบของหายที่ระบุ' })
    }
    throw err
  }
})

export default router
