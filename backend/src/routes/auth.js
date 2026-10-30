import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { pool } from '../db.js'
import { requireLogin } from '../middleware/auth.js'
import { sendMail } from '../mailer.js'

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

// ลืมรหัสผ่าน: ส่งลิงก์รีเซ็ตไปอีเมล (หมดอายุใน 30 นาที ใช้ได้ครั้งเดียว)
// ตอบข้อความเดียวกันเสมอ ไม่ว่าอีเมลจะมีในระบบหรือไม่ เพื่อไม่ให้คนนอกใช้เดาว่าใครสมัครไว้
const RESET_MINUTES = 30
const RESET_COOLDOWN_SECONDS = 60
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex')

router.post('/forgot-password', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase()
  if (!email) return res.status(400).json({ error: 'กรุณากรอกอีเมล' })

  const done = () => res.json({ ok: true, message: 'ถ้าอีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้แล้ว' })

  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (rows.length === 0) return done()

  // ขอถี่เกินไป (ภายใน 1 นาที) ไม่ส่งซ้ำ กันคนยิงอีเมลรัว
  const recent = await pool.query(
    `SELECT 1 FROM password_resets WHERE user_id = $1 AND created_at > now() - make_interval(secs => $2)`,
    [rows[0].id, RESET_COOLDOWN_SECONDS]
  )
  if (recent.rowCount > 0) return done()

  const token = crypto.randomBytes(32).toString('hex')
  // ลิงก์เก่าที่ยังไม่ได้ใช้ถือว่าใช้ไม่ได้อีก (เหลือลิงก์ล่าสุดอันเดียว)
  await pool.query('DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL', [rows[0].id])
  await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + make_interval(mins => $3))`,
    [rows[0].id, sha256(token), RESET_MINUTES]
  )

  try {
    await sendMail({
      to: email,
      subject: 'ตั้งรหัสผ่านใหม่ - ของหายแล้วได้คืน',
      text: `กดลิงก์เพื่อตั้งรหัสผ่านใหม่ (หมดอายุใน ${RESET_MINUTES} นาที ใช้ได้ครั้งเดียว)\n${process.env.FRONTEND_URL}/reset-password?token=${token}\n\nถ้าคุณไม่ได้ขอ ให้ละเว้นอีเมลนี้`,
    })
  } catch (err) {
    console.error('ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ:', err.message) // ไม่บอกผู้ใช้ เพื่อไม่ให้รู้ว่าอีเมลมีในระบบ
  }
  done()
})

// ตั้งรหัสผ่านใหม่ด้วยโทเค็นจากอีเมล
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })
  if (password.length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  }

  const hash = await bcrypt.hash(password, 10)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // ล็อกแถวโทเค็น กันสองคำขอใช้โทเค็นเดียวกันพร้อมกัน
    const { rows } = await client.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() FOR UPDATE`,
      [sha256(String(token))]
    )
    if (rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่' })
    }
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, rows[0].user_id])
    await client.query('UPDATE password_resets SET used_at = now() WHERE id = $1', [rows[0].id])
    await client.query('COMMIT')
    res.json({ ok: true })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})

export default router
