# Lost Item Return Back (ของหายแล้วได้คืน)

ระบบแจ้ง/ค้นหา/ส่งคืนของหาย สำหรับภาควิชาวิทยาการคอมพิวเตอร์ ม.รามคำแหง (วิชา COS4101)
เอกสารอ้างอิง: `docs/lab3 (แกไข_2).pdf` (Use Case UC_01–UC_09)

## Stack

- **Frontend** `frontend/`: Next.js 16.4.3 (App Router, JavaScript), React 19, Tailwind CSS 4 (พอร์ต 3000)
- **Backend** `backend/`: Node.js + Express 5 + `pg` (พอร์ต 4000, `npm run dev`, ค่าตั้งใน `backend/.env`)
- **Database**: PostgreSQL 16 ผ่าน Docker (`docker compose up -d` ที่ root, พอร์ต 5432)
- **ก่อนเขียนโค้ด Next.js ให้อ่าน `frontend/node_modules/next/dist/docs/` เสมอ** (ต่างจากเวอร์ชันที่เคยรู้ ดู frontend/AGENTS.md)
- คำสั่ง: `npm run dev`, `npm run build`, `npm run lint`

## โครงสร้าง

(path ด้านล่างอยู่ใต้ `frontend/`)

- `src/app/layout.js` – root layout, ใส่ `<Navbar />`
- `src/app/navbar.js` – Navbar (client component) เมนูแยกตาม role
- `src/app/register/` – หน้าลงทะเบียน (UC_01)

## Roles

| Role           | สิทธิ์                                                           |
| -------------- | ---------------------------------------------------------------- |
| Outsider/Guest | ดูประชาสัมพันธ์, ติดต่อเจ้าหน้าที่ (สมัครไม่ได้ ต้องใช้ RU Mail) |
| User           | + ค้นหาของหาย, จัดการบัญชี                                       |
| Officer        | + ลงทะเบียน/จัดการของหาย, ยืนยันการส่งมอบ, ส่งประชาสัมพันธ์      |
| System Admin   | + จัดการผู้ใช้/กำหนด Role เป็น officer                           |

## Navbar → Use Case

| เมนู                     | Route                 | UC       | Role           |
| ------------------------ | --------------------- | -------- | -------------- |
| หน้าแรก                  | `/`                   | –        | ทุกคน          |
| แดชบอร์ด                 | `/dashboard`          | –        | officer, admin |
| ประชาสัมพันธ์            | `/broadcast`          | UC_08    | ทุกคน          |
| ติดต่อเจ้าหน้าที่        | `/contact`            | UC_07    | ทุกคน          |
| ค้นหาของหาย              | `/search`             | UC_06    | user+          |
| ลงทะเบียนของหาย          | `/lost-items/new`     | UC_04    | officer, admin |
| จัดการของหาย             | `/lost-items`         | UC_05    | officer, admin |
| ยืนยันการส่งมอบ          | `/returns`            | UC_09    | officer, admin |
| จัดการผู้ใช้/Role        | `/admin/users`        | UC_03    | admin          |
| จัดการบัญชี / ออกจากระบบ | `/account`, `/logout` | UC_03    | ล็อกอินแล้ว    |
| ลงทะเบียน / เข้าสู่ระบบ  | `/register`, `/login` | UC_01/02 | guest          |

## สถานะ / TODO

- Navbar รับ prop `user` (`{ name, role }` หรือ `null`) – layout ดึงจาก backend `/api/auth/me` ผ่าน cookie `token` แล้ว
- สร้างหน้าครบทุกเมนูแล้ว แต่เป็นหน้าเปล่า/ข้อมูลตัวอย่าง ฟอร์มยังไม่ส่งข้อมูล ยังไม่มีฐานข้อมูล
- แต่ละหน้า = โฟลเดอร์ใน `src/app/<ชื่อ>/page.js` (App Router)
- สมัครสมาชิกต้องจำกัดเฉพาะอีเมล RU Mail

## ข้อตกลงการทำงาน (ประหยัดโทเค็น)

- ผู้ใช้เพิ่งเริ่มใช้ Next.js: โค้ดต้องเรียบง่าย แก้เองได้ ตอบเป็นภาษาไทย กระชับ
- ตอบสั้น ไม่สรุปซ้ำสิ่งที่ทำไปแล้ว ไม่เสนอทางเลือกหลายทาง ให้คำแนะนำเดียว
- อย่าอ่านไฟล์ทั้งไฟล์ถ้าไม่จำเป็น ใช้ Grep/ช่วงบรรทัด ห้ามอ่าน `docs/*.pdf` ซ้ำ (สรุป UC อยู่ในไฟล์นี้แล้ว)
- ห้ามอ่าน/ค้นใน `node_modules`, `.next` ยกเว้นเอกสาร Next ที่เกี่ยวกับงานตรง ๆ
- แก้เฉพาะที่ถูกขอ ไม่รีแฟกเตอร์หรือเพิ่มฟีเจอร์เกินคำขอ ไม่สร้าง subagent
- ทำงานเป็นก้อนเดียว (รวมคำสั่งใน Bash ครั้งเดียว) และรัน `npx eslint src` ตอนจบเท่านั้น
- หลังแก้ไขหรือทำงานเสร็จแต่ละครั้ง ให้อัปเดตหัวข้อ "ความคืบหน้า" ในไฟล์นี้ (ทำเสร็จแล้ว/กำลังทำ/ขั้นต่อไป) แบบสั้น 1 บรรทัดต่อรายการ
- อัปเดต `README.md` ที่ root ให้ตรงกับงานล่าสุดด้วยทุกครั้ง (วิธีรัน, API/หน้าใหม่, สถานะ)

## ข้อควรรู้ของเครื่องนี้

- Node ค่าเริ่มต้นเป็น v18 แต่ Next 16 ต้อง >=20.9 → ใช้ `nvm use 22`
- Tailwind v4 ใช้ `@tailwindcss/postcss` ผ่าน `postcss.config.mjs` (ห้ามใส่ loader ใน next.config)
- dev server ปกติอยู่พอร์ต 3000 อย่าเปิดซ้ำ (จะชนกัน)

## ออกแบบฐานข้อมูล (ตามคลาสไดอะแกรม `docs/class_diagram.drawio.png` + `docs/lab3 (แก้ 3).pdf`)

- `users`(id, name, email, password_hash, contact, role[user|officer|admin]) – ไม่มีตาราง Role แยก
- `lost_items`(id, name, detail, location, found_date, image, status[lost|found|returned|disputed], created_by)
- `returns`(id, item_id, receiver_name, receiver_contact, sender_name, witness_name, proof_image, officer_id, returned_at) – ผู้รับ/ผู้ส่ง/พยานเป็นข้อความ รองรับคนนอกที่ไม่ได้ลงทะเบียน
- `disputes`(id, return_id, officer_id, claimant_name, new_detail, new_evidence_image, created_at) – UC_09 กรณีโต้แย้ง ตั้งสถานะของเป็น disputed
- `broadcasts`(id, title, description, image, created_by, item_id ว่างได้, created_at)
- เมธอดในคลาสไดอะแกรม = API route ใน backend ไม่ใช่ข้อมูลในตาราง

## ความคืบหน้า

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
