# ความคืบหน้า

- [x] Navbar แยกตาม role (`src/app/navbar.js`)
- [x] ตั้งค่า Tailwind v4 ผ่าน postcss
- [x] สร้างหน้าครบทุกเมนู (หน้าเปล่า + ข้อมูลตัวอย่าง)
- [x] ธีมสีขาวตลอด (ลบ dark mode) + หน้า 404 เอง (`src/app/not-found.js`)
- [x] แยก `frontend/` + `backend/` (Express) + PostgreSQL Docker, `/api/health` ต่อ DB ได้
- [x] ตาราง users + API สมัคร/เข้าสู่ระบบ/ออก/me (`backend/src/routes/auth.js`, JWT ใน cookie `token`) ทดสอบด้วย curl แล้ว
- [x] README.md ที่ root (วิธีรัน)
- [x] หน้า login/register/logout ต่อ API แล้ว (`frontend/src/lib/api.js` มี `API_URL`/`postJson`) layout.js เป็น async อ่าน cookie `token` แล้วถาม `/api/auth/me` ส่ง user ให้ Navbar ทดสอบแล้ว
- [x] ฟอร์ม register มีช่อง contact + ยืนยันรหัสผ่าน (เช็คฝั่งหน้าเว็บ), `users.contact` เติมผ่าน ALTER ใน `db.js`
- [x] ตาราง `lost_items` (`db.js`) + `backend/src/routes/lost-items.js` (POST/GET `/api/lost-items`, ใช้ `requireRole('officer','admin')` จาก `middleware/auth.js`) ทดสอบด้วย curl แล้ว; DATE คืนเป็นสตริง (setTypeParser)
- [x] ต่อ frontend `/lost-items/new` (ฟอร์ม) และ `/lost-items` (รายการ) กับ API แล้ว (client component, `getJson`/`postJson` ใน `lib/api.js`) ยังไม่มีช่องรูปภาพ; ลอง lint ผ่าน ยังไม่ได้ลองในเบราว์เซอร์
- [x] UC_03 กำหนด role: `backend/src/routes/users.js` (GET `/api/users`, PATCH `/api/users/:id/role` เฉพาะ admin, ตั้งได้แค่ user/officer และไม่แตะบัญชี admin) + หน้า `/admin/users` ต่อ API แล้ว (admin คนแรกยังต้องตั้งผ่าน SQL) ทดสอบ curl แล้ว
- [x] หน้า `/account`: GET/PATCH `/api/auth/profile`, PATCH `/api/auth/password` + หน้าเว็บโหมดดู + ปุ่มแก้ไขข้อมูล/เปลี่ยนรหัสผ่าน (lint ผ่าน ยังไม่ลองในเบราว์เซอร์)
- [x] แดชบอร์ด officer/admin `/dashboard` (สรุปจำนวนตามสถานะ + ปุ่มลัด, login แล้ว redirect ตาม role, เมนูใน Navbar) lint ยังไม่รัน/ยังไม่ลองในเบราว์เซอร์
- [ ] ตาราง returns/disputes/broadcasts + API ที่เหลือ, อัปโหลดรูป
- [ ] ตรวจสิทธิ์ role ฝั่งหน้าเว็บ (frontend) ของหน้า officer/admin
- [ ] (งานเสริมหลังระบบหลักเสร็จ) ลืมรหัสผ่านในหน้า login: ส่งลิงก์รีเซ็ตไป RU Mail (ต้องตั้ง SMTP + token หมดอายุ)
