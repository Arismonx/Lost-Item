import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// UC_07 รายชื่อเจ้าหน้าที่สำหรับติดต่อ (ทุกคนดูได้ ไม่ต้องล็อกอิน) ส่งเฉพาะชื่อ/อีเมล/เบอร์ติดต่อ
router.get('/officers', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, contact FROM users WHERE role = 'officer' ORDER BY name`
  )
  res.json({ officers: rows })
})

export default router
