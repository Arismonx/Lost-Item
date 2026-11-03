# Bug Report

> ฟอร์มตามแบบรายงานบัคของวิชา ช่อง `____` คือข้อมูลที่ต้องกรอกเอง (ชื่อคน, รหัส, เวอร์ชัน) ที่เหลือมาจากสิ่งที่เกิดขึ้นจริงตอนทำงาน

**Project Name:** Lost Item Return Back (ของหายแล้วได้คืน) COS4101 **Project ID:** ____

---

## B-001

| | |
| --- | --- |
| Module Name | ประชาสัมพันธ์ (Broadcast) |
| Module ID | ____ |
| Program Name | broadcast (`/broadcast`) |
| Program ID | ____ |
| Tester | ____ |
| Date | 03/11/2026 |
| Assigned To | ____ |
| Bug No | B-001 |

**Title:** ออกจากระบบแล้วหน้าประชาสัมพันธ์ยังแสดงปุ่ม "เพิ่มประชาสัมพันธ์"

**Description:** ล็อกอินเป็น officer หรือ admin แล้วเปิดหน้า `/broadcast` จากนั้นออกจากระบบและกลับมาหน้า `/broadcast` ปุ่ม "+ เพิ่มประชาสัมพันธ์" ที่ควรเห็นเฉพาะเจ้าหน้าที่ยังแสดงอยู่ เหมือนยังล็อกอินอยู่ (กดส่งประกาศจริงไม่ได้ เพราะ backend ตรวจสิทธิ์ซ้ำ แต่แสดงผลผิด)

**สาเหตุ:** Next.js จำสถานะของหน้าที่เคยเปิดไว้ หน้า `/broadcast` เก็บข้อมูลผู้ใช้ไว้ในตัวแปรที่โหลดครั้งเดียวตอนเปิดหน้า การออกจากระบบแบบเปลี่ยนหน้าธรรมดาจึงไม่ล้างค่านี้

**Resolution:** ☑ Fixed ☐ Duplicate ☐ Can't Fix ☐ Won't Fix

| | |
| --- | --- |
| Date Resolve | 03/11/2026 |
| Resolved by | ____ |
| Version | V ____ |

**Resolution Comment:** ให้หน้า logout, login และ register โหลดหน้าใหม่ทั้งหมด (`window.location`) ทุกหน้าจึงดึงข้อมูลผู้ใช้ใหม่ (ไฟล์ `frontend/src/app/logout/page.js`, `login/page.js`, `register/page.js`)

| | |
| --- | --- |
| Retested By | ____ |
| Version Tested | V ____ |
| Date Tested | 03/11/2026 |

**Retest Comment:** ออกจากระบบแล้วเปิดหน้า `/broadcast` ปุ่มเพิ่มประชาสัมพันธ์ไม่แสดง ใช้งานได้ปกติ

---

## B-002

| | |
| --- | --- |
| Module Name | ประชาสัมพันธ์ (Broadcast) |
| Module ID | ____ |
| Program Name | broadcast (`/broadcast`) และหน้าแรก (`/`) |
| Program ID | ____ |
| Tester | ____ |
| Date | 03/11/2026 |
| Assigned To | ____ |
| Bug No | B-002 |

**Title:** ประชาสัมพันธ์ยังแสดงของที่ส่งคืนแล้ว

**Description:** เมื่อเจ้าหน้าที่ยืนยันการส่งมอบของหายแล้ว (สถานะ returned) หรือมีข้อโต้แย้ง (disputed) ประกาศของชิ้นนั้นยังค้างอยู่ที่หน้า `/broadcast` และส่วน "ประชาสัมพันธ์ล่าสุด" ของหน้าแรก ทำให้ผู้ใช้เข้าใจว่าของยังรอรับคืนอยู่

**สาเหตุ:** `GET /api/broadcasts` ดึงทุกแถวจากตาราง `broadcasts` โดยไม่ดูสถานะของหายที่ผูกอยู่ และตอนยืนยันส่งมอบก็ไม่ได้ลบประกาศ

**Resolution:** ☑ Fixed ☐ Duplicate ☐ Can't Fix ☐ Won't Fix

| | |
| --- | --- |
| Date Resolve | 03/11/2026 |
| Resolved by | ____ |
| Version | V ____ |

**Resolution Comment:** แก้ `GET /api/broadcasts` ให้ join กับตาราง `lost_items` และซ่อนประกาศที่ของมีสถานะ returned หรือ disputed ประกาศที่เจ้าหน้าที่เขียนเอง (ไม่ผูกกับของ) ยังแสดงตามเดิม ข้อมูลในฐานข้อมูลไม่ถูกลบ (ไฟล์ `backend/src/routes/broadcasts.js`) ตอนตรวจพบประกาศของที่ส่งคืนแล้ว 4 รายการ ซึ่งถูกซ่อน เหลือแสดง 5 รายการ

| | |
| --- | --- |
| Retested By | ____ |
| Version Tested | V ____ |
| Date Tested | 03/11/2026 |

**Retest Comment:** ของที่ส่งคืนแล้วไม่แสดงในหน้าประชาสัมพันธ์และหน้าแรก ใช้งานได้ปกติ

---

## B-003

| | |
| --- | --- |
| Module Name | ประชาสัมพันธ์ / จัดการของหาย |
| Module ID | ____ |
| Program Name | broadcast (`/broadcast`), lost-items (`/lost-items`) |
| Program ID | ____ |
| Tester | ____ |
| Date | 03/11/2026 |
| Assigned To | ____ |
| Bug No | B-003 |

**Title:** เจ้าหน้าที่ลบประชาสัมพันธ์และลบของหายไม่ได้

**Description:** ประกาศที่พิมพ์ผิดหรือส่งซ้ำ และของหายที่ลงทะเบียนผิด ไม่มีปุ่มหรือ API ให้ลบ ต้องแก้ในฐานข้อมูลโดยตรง

**Resolution:** ☑ Fixed ☐ Duplicate ☐ Can't Fix ☐ Won't Fix

| | |
| --- | --- |
| Date Resolve | 03/11/2026 |
| Resolved by | ____ |
| Version | V ____ |

**Resolution Comment:** เพิ่ม `DELETE /api/broadcasts/:id` และ `DELETE /api/lost-items/:id` (เฉพาะ officer, admin) พร้อมปุ่ม "ลบ" ในสองหน้า ลบของหายได้เฉพาะสถานะรอรับคืน เพราะของที่ส่งคืนแล้วมีประวัติการส่งมอบผูกอยู่ (ระบบตอบ 409) และลบประกาศที่ผูกอยู่กับไฟล์รูปให้ด้วย ทดสอบด้วย curl ผ่านทุกกรณี: สำเร็จ 200, ไม่ล็อกอิน 401, ไม่มีสิทธิ์ 403, ลบซ้ำ 404, ลบของที่ส่งคืนแล้ว 409

| | |
| --- | --- |
| Retested By | ____ |
| Version Tested | V ____ |
| Date Tested | 03/11/2026 |

**Retest Comment:** กดลบประชาสัมพันธ์และลบของหายในเบราว์เซอร์ได้ตามต้องการ ใช้งานได้ปกติ

---

## Signature

| | |
| --- | --- |
| Tester | ____ |
| Programmer | ____ |
| Project Manager | ____ |

---

หมายเหตุ: บัคเล็กน้อยอื่น ๆ (เช่น คำเตือน lint ในหน้า register, ความเสี่ยงที่หน้าอื่นค้างสถานะผู้ใช้เดิม) อยู่ใน [BUGS.md](BUGS.md)
