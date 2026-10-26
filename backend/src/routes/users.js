import { Router } from 'express'
import { pool } from '../db.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

// UC_03 เฉพาะแอดมินเท่านั้นที่จัดการผู้ใช้ได้
router.use(requireRole('admin'))

// ดูผู้ใช้ทั้งหมด (ไม่ส่งรหัสผ่านออกไป)
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, contact, role FROM users ORDER BY id'
  )
  res.json({ users: rows })
})

// กำหนด role ให้ผู้ใช้ เป็น user หรือ officer (ไม่ยุ่งกับบัญชี admin เพื่อไม่ให้ล็อกตัวเองออก)
router.patch('/:id/role', async (req, res) => {
  const { role } = req.body
  if (!['user', 'officer'].includes(role)) {
    return res.status(400).json({ error: 'role ต้องเป็น user หรือ officer' })
  }

  const { rows } = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2 AND role <> 'admin'
     RETURNING id, name, email, contact, role`,
    [role, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'ไม่พบผู้ใช้ หรือเป็นบัญชี admin' })
  res.json({ user: rows[0] })
})

export default router
