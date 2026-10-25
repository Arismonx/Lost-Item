import jwt from 'jsonwebtoken'

// อ่าน token จาก cookie แล้วใส่ req.user = { id, name, role } (ถ้าไม่ล็อกอินจะเป็น null)
export function loadUser(req, res, next) {
  req.user = null
  const token = req.cookies.token
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      // token หมดอายุหรือไม่ถูกต้อง ถือว่าไม่ได้ล็อกอิน
    }
  }
  next()
}

// ต้องล็อกอิน
export function requireLogin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  next()
}

// ต้องมี role ที่กำหนด เช่น requireRole('officer', 'admin')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' })
    next()
  }
}
