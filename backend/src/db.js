import pg from 'pg'

// ตัวเชื่อมต่อ PostgreSQL (อ่านค่าจาก DATABASE_URL ใน .env)
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// สร้างตารางตอนเริ่มเซิร์ฟเวอร์ (ถ้ายังไม่มี)
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      contact       TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'officer', 'admin')),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  // ตารางที่สร้างไว้ก่อนมี contact จะยังไม่มีคอลัมน์นี้ (CREATE TABLE ข้างบนไม่แก้ตารางเดิม) จึงเติมให้
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS contact TEXT NOT NULL DEFAULT ''`)
}
