import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import { requireLogin } from '../middleware/auth.js'

const router = Router()

// อนุญาตเฉพาะอีเมล RU Mail
const RU_MAIL = /^[^\s@]+@([a-z0-9-]+\.)*ru\.ac\.th$/i

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function setLoginCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.cookie('token', token, COOKIE_OPTIONS)
}

// UC_01 ลงทะเบียน
router.post('/register', async (req, res) => {
  const { name, email, password, contact } = req.body
  if (!name || !email || !password || !contact) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' })
  }
  if (!RU_MAIL.test(email)) {
    return res.status(400).json({ error: 'ใช้ได้เฉพาะอีเมล RU Mail (@ru.ac.th) เท่านั้น' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  }

  const hash = await bcrypt.hash(password, 10)
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, contact) VALUES ($1, $2, $3, $4) RETURNING id, name, role',
      [name.trim(), email.toLowerCase(), hash, contact.trim()]
    )
    setLoginCookie(res, rows[0])
    res.status(201).json({ user: rows[0] })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'อีเมลนี้ถูกใช้สมัครแล้ว' })
    throw err
  }
})

// UC_02 เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' })
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  }

  setLoginCookie(res, user)
  res.json({ user: { id: user.id, name: user.name, role: user.role } })
})

// ออกจากระบบ
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS)
  res.json({ ok: true })
})

// ดูผู้ใช้ปัจจุบัน (ใช้ส่งให้ Navbar)
router.get('/me', requireLogin, (req, res) => {
  const { id, name, role } = req.user
  res.json({ user: { id, name, role } })
})

// UC_03 ดูข้อมูลบัญชีตัวเอง
router.get('/profile', requireLogin, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, contact, role FROM users WHERE id = $1',
    [req.user.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'ไม่พบบัญชี' })
  res.json({ user: rows[0] })
})

// UC_03 แก้ชื่อ/เบอร์ติดต่อของตัวเอง
router.patch('/profile', requireLogin, async (req, res) => {
  const { name, contact } = req.body
  if (!name?.trim() || !contact?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อและเบอร์ติดต่อ' })
  }
  const { rows } = await pool.query(
    'UPDATE users SET name = $1, contact = $2 WHERE id = $3 RETURNING id, name, email, contact, role',
    [name.trim(), contact.trim(), req.user.id]
  )
  setLoginCookie(res, rows[0]) // ชื่ออยู่ใน token ต้องออกใหม่
  res.json({ user: rows[0] })
})

// UC_03 เปลี่ยนรหัสผ่านของตัวเอง
router.patch('/password', requireLogin, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'กรุณากรอกรหัสผ่านให้ครบ' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' })
  }
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
  if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
    return res.status(401).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })
  }
  const hash = await bcrypt.hash(newPassword, 10)
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id])
  res.json({ ok: true })
})

export default router
