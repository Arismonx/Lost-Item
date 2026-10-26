import pg from 'pg'

// ให้ชนิด DATE ส่งกลับเป็นข้อความ 'YYYY-MM-DD' (ถ้าไม่ตั้ง pg จะแปลงเป็น Date แล้ววันที่เลื่อนตามเขตเวลา)
pg.types.setTypeParser(1082, (v) => v)

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

  // ตารางของหาย (UC_04/05) สถานะเริ่มต้นคือ found = เจ้าหน้าที่เก็บของได้แล้ว รอเจ้าของมารับ
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lost_items (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      detail     TEXT NOT NULL DEFAULT '',
      location   TEXT NOT NULL,
      found_date DATE NOT NULL,
      image      TEXT,
      status     TEXT NOT NULL DEFAULT 'found' CHECK (status IN ('lost', 'found', 'returned', 'disputed')),
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}
