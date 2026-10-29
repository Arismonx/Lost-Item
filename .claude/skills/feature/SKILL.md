---
name: feature
description: เพิ่ม/แก้ฟีเจอร์ของระบบ (หน้าเว็บ, API, ตาราง, use case UC_01–UC_09) ใช้ทุกครั้งที่ต้องเพิ่มหน้า เพิ่ม API หรือต่อฟอร์มกับ backend
---

# ขั้นตอนทำฟีเจอร์ (ทำตามลำดับ ห้ามข้าม ถ้าข้ามต้องบอกเหตุผล)

1. **UC/สิทธิ์**: ดูตาราง Navbar → UC และ Roles ใน CLAUDE.md ว่าเมนูนี้คือ UC ไหน role ไหนเข้าได้
2. **ตาราง**: ถ้าต้องมีตารางใหม่/คอลัมน์ใหม่ ดู skill `db-schema` แล้วเพิ่มใน `backend/src/db.js`
3. **API**: สร้าง `backend/src/routes/<ชื่อ>.js` (ดูแบบจาก `lost-items.js`) ใช้ `requireRole(...)` จาก `middleware/auth.js` ตามสิทธิ์ แล้วลงทะเบียน `app.use('/api/<ชื่อ>', ...)` ใน `backend/src/index.js`
4. **ทดสอบ API ด้วย curl** (login เก็บ cookie ก่อน) ทั้งกรณีสำเร็จและไม่มีสิทธิ์
5. **หน้าเว็บ**: `frontend/src/app/<ชื่อ>/page.js` (client component ถ้ามีฟอร์ม) ใช้ `getJson`/`postJson` จาก `src/lib/api.js` ตรวจ role ฝั่งหน้าเว็บด้วย ก่อนเขียนโค้ด Next.js ให้ดู `frontend/node_modules/next/dist/docs/` เฉพาะหัวข้อที่ใช้
6. **Lint**: `cd frontend && npx eslint src` (ต้องใช้ `nvm use 22`)
7. **บันทึก**: อัปเดต `docs/PROGRESS.md` (1 บรรทัดต่อรายการ) และ `README.md` (วิธีรัน/API/หน้าใหม่/สถานะ)
8. **สรุปให้ผู้ใช้สั้น ๆ**: ทำอะไรแล้ว, ยังไม่ได้ทำ/ยังไม่ได้ลองในเบราว์เซอร์อะไร
