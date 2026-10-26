import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { pool, initDb } from './db.js'
import { loadUser } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import lostItemRoutes from './routes/lost-items.js'
import userRoutes from './routes/users.js'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(loadUser)

// เช็กว่าเซิร์ฟเวอร์และฐานข้อมูลทำงานอยู่
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, db: 'connected' })
  } catch (err) {
    res.status(500).json({ ok: false, db: err.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/lost-items', lostItemRoutes)
app.use('/api/users', userRoutes)

const port = process.env.PORT || 4000

initDb().then(() => {
  app.listen(port, () => console.log(`Backend running on http://localhost:${port}`))
})
