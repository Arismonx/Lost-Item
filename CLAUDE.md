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
- ระบบหลัก UC_01–UC_09 ทำครบและต่อ backend/DB จริงแล้ว รวมอัปโหลดรูปของหาย (`/uploads/items` สาธารณะ) และรูปหลักฐานส่งมอบ/โต้แย้ง (`/api/returns/images/:name` เฉพาะ officer/admin) รายละเอียดดู `docs/PROGRESS.md`
- **Branch ปัจจุบัน: `ui-work`** (แตกจาก commit `0ff1f40`) กำลังปรับ UI ต่อ ให้ commit ลง branch นี้ ห้าม merge `main` เข้ามา
- **ไม่ใช้ระบบลืมรหัสผ่านทางอีเมล** (หน้า `/forgot-password`, `/reset-password`, `mailer.js`, ตาราง `password_resets`) โค้ดนั้นอยู่ที่ `main` (commit `f44d01a`, `6eefe73`) และ tag `v1-with-email-reset` เท่านั้น ห้าม cherry-pick/merge เข้า `ui-work` ถ้าจะทำลืมรหัสผ่านใหม่ ให้ทำแบบแอดมินรีเซ็ตให้ที่ `/admin/users` (ยังไม่ได้ทำ) ตอนรวมเข้า `main` ต้อง `git revert` สอง commit นั้นก่อน
- ตาราง `password_resets` ที่ค้างใน DB ไม่มีผลต่อโค้ดเวอร์ชันนี้ ไม่ต้องลบ
- แต่ละหน้า = โฟลเดอร์ใน `src/app/<ชื่อ>/page.js` (App Router)
- สมัครสมาชิกต้องจำกัดเฉพาะอีเมล RU Mail

## ข้อตกลงการทำงาน (ประหยัดโทเค็น)

- ผู้ใช้เพิ่งเริ่มใช้ Next.js: โค้ดต้องเรียบง่าย แก้เองได้ ตอบเป็นภาษาไทย กระชับ
- ตอบสั้น ไม่สรุปซ้ำสิ่งที่ทำไปแล้ว ไม่เสนอทางเลือกหลายทาง ให้คำแนะนำเดียว
- อย่าอ่านไฟล์ทั้งไฟล์ถ้าไม่จำเป็น ใช้ Grep/ช่วงบรรทัด ห้ามอ่าน `docs/*.pdf` ซ้ำ (สรุป UC อยู่ในไฟล์นี้แล้ว)
- ห้ามอ่าน/ค้นใน `node_modules`, `.next` ยกเว้นเอกสาร Next ที่เกี่ยวกับงานตรง ๆ
- แก้เฉพาะที่ถูกขอ ไม่รีแฟกเตอร์หรือเพิ่มฟีเจอร์เกินคำขอ ไม่สร้าง subagent
- ทำงานเป็นก้อนเดียว (รวมคำสั่งใน Bash ครั้งเดียว) และรัน `npx eslint src` ตอนจบเท่านั้น
- หลังทำงานเสร็จ อัปเดต `docs/PROGRESS.md` (ทำเสร็จแล้ว/กำลังทำ/ขั้นต่อไป) แบบสั้น 1 บรรทัดต่อรายการ
- อัปเดต `README.md` ที่ root ให้ตรงกับงานล่าสุดด้วยทุกครั้ง (วิธีรัน, API/หน้าใหม่, สถานะ)

## ข้อควรรู้ของเครื่องนี้

- Node ค่าเริ่มต้นเป็น v18 แต่ Next 16 ต้อง >=20.9 → ใช้ `nvm use 22`
- Tailwind v4 ใช้ `@tailwindcss/postcss` ผ่าน `postcss.config.mjs` (ห้ามใส่ loader ใน next.config)
- dev server ปกติอยู่พอร์ต 3000 อย่าเปิดซ้ำ (จะชนกัน)

## Skills (โหลดเมื่อใช้เท่านั้น)

- งานเพิ่ม/แก้ฟีเจอร์ (หน้า, API, ฟอร์ม) ทุกครั้งต้องใช้ skill `feature` (เช็คลิสต์ตั้งแต่ตารางจนอัปเดตเอกสาร)
- ออกแบบฐานข้อมูล/โครงตาราง → skill `db-schema`
- ความคืบหน้า/TODO → `docs/PROGRESS.md`
