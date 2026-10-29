---
name: db-schema
description: ออกแบบฐานข้อมูลของโปรเจกต์ (users, lost_items, returns, disputes, broadcasts) ใช้เมื่อสร้าง/แก้ตารางหรือ query ที่เกี่ยวกับตาราง
---

# ออกแบบฐานข้อมูล

อ้างอิง `docs/class_diagram.drawio.png` + `docs/lab3 (แก้ 3).pdf` (ห้ามอ่าน PDF ซ้ำ สรุปอยู่ที่นี่แล้ว)

- `users`(id, name, email, password_hash, contact, role[user|officer|admin]) – ไม่มีตาราง Role แยก
- `lost_items`(id, name, detail, location, found_date, image, status[lost|found|returned|disputed], created_by)
- `returns`(id, item_id, receiver_name, receiver_contact, sender_name, witness_name, proof_image, officer_id, returned_at) – ผู้รับ/ผู้ส่ง/พยานเป็นข้อความ รองรับคนนอกที่ไม่ได้ลงทะเบียน
- `disputes`(id, return_id, officer_id, claimant_name, new_detail, new_evidence_image, created_at) – UC_09 กรณีโต้แย้ง ตั้งสถานะของเป็น disputed
- `broadcasts`(id, title, description, image, created_by, item_id ว่างได้, created_at)
- เมธอดในคลาสไดอะแกรม = API route ใน backend ไม่ใช่ข้อมูลในตาราง

ตารางสร้างใน `backend/src/db.js` (CREATE TABLE IF NOT EXISTS; เพิ่มคอลัมน์ทีหลังใช้ ALTER ... IF NOT EXISTS)
