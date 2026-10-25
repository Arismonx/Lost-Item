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
│       ├── routes/      API แยกตามหมวด (auth.js)
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

| ตัวแปร         | ความหมาย                      | ค่าตัวอย่าง                                             |
| -------------- | ----------------------------- | ------------------------------------------------------- |
| `PORT`         | พอร์ตของ backend              | `4000`                                                  |
| `DATABASE_URL` | ที่อยู่ฐานข้อมูล              | `postgres://lostitem:lostitem_pw@localhost:5432/lostitem` |
| `FRONTEND_URL` | ที่อยู่ frontend (ใช้ตั้ง CORS) | `http://localhost:3000`                                 |
| `JWT_SECRET`   | คีย์ลับสำหรับเซ็น token login | สตริงสุ่มยาว ๆ (ห้ามใช้ค่าตัวอย่างตอนใช้งานจริง)          |

> ไฟล์ `.env` ไม่ถูกอัปโหลดขึ้น git ให้ใช้ `.env.example` เป็นแม่แบบ
> รหัสผ่านฐานข้อมูลใน `docker-compose.yml` เป็นค่าสำหรับพัฒนาในเครื่องเท่านั้น

## API ที่มีตอนนี้

| Method | Path                 | ทำอะไร                                  | UC    |
| ------ | -------------------- | --------------------------------------- | ----- |
| GET    | `/api/health`        | เช็กเซิร์ฟเวอร์และฐานข้อมูล             | –     |
| POST   | `/api/auth/register` | สมัครสมาชิก (เฉพาะอีเมล `@ru.ac.th`)    | UC_01 |
| POST   | `/api/auth/login`    | เข้าสู่ระบบ (ตั้ง cookie `token`)       | UC_02 |
| POST   | `/api/auth/logout`   | ออกจากระบบ                              | UC_02 |
| GET    | `/api/auth/me`       | ดูผู้ใช้ที่ล็อกอินอยู่                  | –     |

ตัวอย่างสมัครสมาชิก:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"สมชาย ใจดี","email":"somchai@rumail.ru.ac.th","password":"12345678"}'
```

## Role และการตั้งแอดมินคนแรก

มี 3 role: `user` (ค่าเริ่มต้นตอนสมัคร), `officer`, `admin` ผู้ใช้ที่สมัครใหม่จะเป็น `user` เสมอ
การตั้งแอดมินคนแรกต้องแก้ในฐานข้อมูลโดยตรง:

```bash
docker exec lostitem-db psql -U lostitem -c \
  "UPDATE users SET role='admin' WHERE email='อีเมลของคุณ@rumail.ru.ac.th'"
```

หลังจากนั้นแอดมินกำหนด role ให้คนอื่นผ่านหน้า "จัดการผู้ใช้/Role" ได้ (ยังไม่ทำ)

## คำสั่งที่ใช้บ่อย

| ทำอะไร                  | คำสั่ง                                         |
| ----------------------- | ---------------------------------------------- |
| หยุดฐานข้อมูล           | `docker compose stop`                          |
| ล้างข้อมูลทั้งหมดในฐานข้อมูล | `docker compose down -v` (ข้อมูลหายถาวร)   |
| เข้า psql               | `docker exec -it lostitem-db psql -U lostitem` |
| ตรวจโค้ด frontend       | `cd frontend && npx eslint src`                |

## ความคืบหน้า

- [x] Frontend: Navbar แยกตาม role และหน้าครบทุกเมนู (ยังเป็นหน้าเปล่า / ข้อมูลตัวอย่าง)
- [x] Backend: Express + PostgreSQL (Docker)
- [x] Backend: สมัคร / เข้าสู่ระบบ / ออกจากระบบ (JWT ใน cookie)
- [ ] Frontend: ต่อหน้า login / register กับ API และส่ง `user` ให้ Navbar
- [ ] Backend + Frontend: ลงทะเบียน / จัดการของหาย, ค้นหา, ประชาสัมพันธ์, ส่งมอบ, จัดการผู้ใช้
- [ ] ตกแต่ง UI ทั้งระบบ
