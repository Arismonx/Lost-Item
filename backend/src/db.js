import pg from 'pg'

// ตัวเชื่อมต่อ PostgreSQL (อ่านค่าจาก DATABASE_URL ใน .env)
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
