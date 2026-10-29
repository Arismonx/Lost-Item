# ของหายแล้วได้คืน (Lost Item Return Back)

ระบบแจ้ง / ค้นหา / ส่งคืนของหาย สำหรับภาควิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยรามคำแหง (วิชา COS4101)

## โครงสร้างโปรเจกต์

```
lostitem-return-back/
├── frontend/            Next.js 16 (App Router) + Tailwind CSS 4  → พอร์ต 3000
├── backend/             Node.js + Express 5 + pg                  → พอร์ต 4000
│   └── src/
│       ├── index.js     จุดเริ่มต้นของเซิร์ฟเวอร์
│       ├── db.js        เชื่อม PostgreSQL + สร้างตาราง
│       ├── routes/      API แยกตามหมวด (auth.js, lost-items.js, users.js)
│       └── middleware/  ตรวจ login / role
├── docker-compose.yml   PostgreSQL 16                             → พอร์ต 5432
└── docs/                เอกสาร Use Case
```

## สิ่งที่ต้องมี

- Node.js 20.9 ขึ้นไป (แนะนำ 22: `nvm use 22`) เพราะ Next.js 16 ใช้ Node 18 ไม่ได้
- Docker + Docker Compose

## วิธีรัน (ทำตามลำดับ)

### 1. เปิดฐานข้อมูล PostgreSQL

```bash
docker compose up -d
```

คำสั่งนี้รันที่โฟลเดอร์หลัก (ครั้งแรกจะดาวน์โหลด image ให้) ตรวจสอบสถานะด้วย `docker ps` ควรเห็น container ชื่อ `lostitem-db`

### 2. รัน Backend

```bash
cd backend
cp .env.example .env     # ครั้งแรกครั้งเดียว แล้วแก้ JWT_SECRET ให้เป็นค่าสุ่มยาว ๆ
npm install              # ครั้งแรกครั้งเดียว
npm run dev
```

เมื่อรันสำเร็จจะเห็น `Backend running on http://localhost:4000` ตารางในฐานข้อมูลจะถูกสร้างเองตอนเริ่มเซิร์ฟเวอร์

ทดสอบ: เปิด <http://localhost:4000/api/health> ควรได้ `{"ok":true,"db":"connected"}`

### 3. รัน Frontend

เปิดอีกหน้าต่าง terminal:

```bash
cd frontend
npm install              # ครั้งแรกครั้งเดียว
npm run dev
```

เปิดเว็บที่ <http://localhost:3000>

## ตัวแปรใน `backend/.env`

| ตัวแปร         | ความหมาย                        | ค่าตัวอย่าง                                               |
| -------------- | ------------------------------- | --------------------------------------------------------- |
| `PORT`         | พอร์ตของ backend                | `4000`                                                    |
| `DATABASE_URL` | ที่อยู่ฐานข้อมูล                | `postgres://lostitem:lostitem_pw@localhost:5432/lostitem` |
| `FRONTEND_URL` | ที่อยู่ frontend (ใช้ตั้ง CORS) | `http://localhost:3000`                                   |
| `JWT_SECRET`   | คีย์ลับสำหรับเซ็น token login   | สตริงสุ่มยาว ๆ (ห้ามใช้ค่าตัวอย่างตอนใช้งานจริง)          |

> ไฟล์ `.env` ไม่ถูกอัปโหลดขึ้น git ให้ใช้ `.env.example` เป็นแม่แบบ
> รหัสผ่านฐานข้อมูลใน `docker-compose.yml` เป็นค่าสำหรับพัฒนาในเครื่องเท่านั้น

## API ที่มีตอนนี้

| Method | Path                 | ทำอะไร                               | UC    |
| ------ | -------------------- | ------------------------------------ | ----- |
| GET    | `/api/health`        | เช็กเซิร์ฟเวอร์และฐานข้อมูล          | –     |
| POST   | `/api/auth/register` | สมัครสมาชิก (เฉพาะอีเมล `@ru.ac.th`) | UC_01 |
| POST   | `/api/auth/login`    | เข้าสู่ระบบ (ตั้ง cookie `token`)    | UC_02 |
| POST   | `/api/auth/logout`   | ออกจากระบบ                           | UC_02 |
| GET    | `/api/auth/me`       | ดูผู้ใช้ที่ล็อกอินอยู่               | –     |
| GET    | `/api/auth/profile`  | ดูข้อมูลบัญชีตัวเอง (ต้องล็อกอิน)    | UC_03 |
| PATCH  | `/api/auth/profile`  | แก้ชื่อ/เบอร์ติดต่อของตัวเอง         | UC_03 |
| PATCH  | `/api/auth/password` | เปลี่ยนรหัสผ่านของตัวเอง             | UC_03 |
| POST   | `/api/lost-items`    | ลงทะเบียนของหาย (officer, admin)     | UC_04 |
| GET    | `/api/lost-items`    | ดูรายการของหายทั้งหมด (officer, admin) | UC_05 |
| GET    | `/api/users`         | ดูผู้ใช้ทั้งหมด (admin)              | UC_03 |
| PATCH  | `/api/users/:id/role`| กำหนด role เป็น user/officer (admin) | UC_03 |

ตัวอย่างสมัครสมาชิก:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"สมชาย ใจดี","email":"somchai@rumail.ru.ac.th","password":"12345678","contact":"081-234-5678"}'
```

## การล็อกอินทำงานอย่างไร

1. หน้า login / register (ฝั่งเบราว์เซอร์) เรียก backend ที่ `http://localhost:4000` backend ตั้ง cookie `token` (JWT)
2. `frontend/src/app/layout.js` อ่าน cookie นี้ แล้วถาม `/api/auth/me` เพื่อได้ชื่อและ role ส่งให้ Navbar
3. หน้า `/logout` เรียก `/api/auth/logout` เพื่อล้าง cookie แล้วกลับหน้าแรก

ถ้า backend อยู่คนละที่กับค่าเริ่มต้น ให้สร้าง `frontend/.env.local` แล้วใส่ `NEXT_PUBLIC_API_URL=http://ที่อยู่-backend`
ต้องเปิดทั้ง frontend และ backend พร้อมกัน ถ้าปิด backend ไว้ Navbar จะแสดงเป็นผู้เยี่ยมชม (ยังไม่ล็อกอิน)

## Role และการตั้งแอดมินคนแรก

มี 3 role: `user` (ค่าเริ่มต้นตอนสมัคร), `officer`, `admin` ผู้ใช้ที่สมัครใหม่จะเป็น `user` เสมอ
การตั้งแอดมินคนแรกต้องแก้ในฐานข้อมูลโดยตรง:

```bash
docker exec lostitem-db psql -U lostitem -c \
  "UPDATE users SET role='admin' WHERE email='อีเมลของคุณ@rumail.ru.ac.th'"
```

หลังจากนั้นแอดมินกำหนด role ให้คนอื่นผ่านหน้า "จัดการผู้ใช้/Role" (`/admin/users`) ได้ โดยตั้งได้เฉพาะ `user` หรือ `officer`

## คำสั่งที่ใช้บ่อย

| ทำอะไร                       | คำสั่ง                                         |
| ---------------------------- | ---------------------------------------------- |
| หยุดฐานข้อมูล                | `docker compose stop`                          |
| ล้างข้อมูลทั้งหมดในฐานข้อมูล | `docker compose down -v` (ข้อมูลหายถาวร)       |
| เข้า psql                    | `docker exec -it lostitem-db psql -U lostitem` |
| ตรวจโค้ด frontend            | `cd frontend && npx eslint src`                |

## ความคืบหน้า

- [x] Frontend: Navbar แยกตาม role และหน้าครบทุกเมนู (ยังเป็นหน้าเปล่า / ข้อมูลตัวอย่าง)
- [x] Backend: Express + PostgreSQL (Docker)
- [x] Backend: สมัคร / เข้าสู่ระบบ / ออกจากระบบ (JWT ใน cookie)
- [x] Frontend: หน้า login / register / logout ต่อกับ API แล้ว และ Navbar แสดงเมนูตาม role ของผู้ใช้จริง
- [x] Backend: ตาราง `lost_items` + API ลงทะเบียน/ดูของหาย จำกัดสิทธิ์ officer/admin (ทดสอบด้วย curl แล้ว)
- [x] Frontend: หน้า `/lost-items/new` (บันทึก) และ `/lost-items` (แสดงรายการจริง) ต่อกับ API แล้ว (ยังไม่มีรูปภาพ)
- [x] Frontend: หน้า `/dashboard` สำหรับ officer/admin (สรุปจำนวนของตามสถานะ + ปุ่มลัด), login แล้วพาไปตาม role
- [x] UC_03: แอดมินกำหนด role ผ่านหน้า `/admin/users` + API
- [x] UC_03: หน้า `/account` แสดงข้อมูลบัญชี มีปุ่มแก้ชื่อ/เบอร์ติดต่อ และเปลี่ยนรหัสผ่านของตัวเอง + API
- [ ] Backend + Frontend: ลงทะเบียน / จัดการของหาย, ค้นหา, ประชาสัมพันธ์, ส่งมอบ, จัดการผู้ใช้
- [ ] ตกแต่ง UI ทั้งระบบ
- [ ] (งานเสริม) ลืมรหัสผ่านในหน้า login ส่งลิงก์รีเซ็ตทาง RU Mail
