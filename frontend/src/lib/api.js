// ที่อยู่ backend (ตั้งค่าใหม่ได้ใน frontend/.env.local เช่น NEXT_PUBLIC_API_URL=http://localhost:4000)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// เรียก API จากฝั่งเบราว์เซอร์ (แนบ cookie ไปด้วย) คืนค่า { ok, data }
export async function postJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// ดึงข้อมูลจาก API ฝั่งเบราว์เซอร์ (แนบ cookie ไปด้วย) คืนค่า { ok, data }
export async function getJson(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// แก้ไขข้อมูลผ่าน API (PATCH) ฝั่งเบราว์เซอร์ คืนค่า { ok, data }
export async function patchJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// ส่งฟอร์มที่มีไฟล์ (FormData) ฝั่งเบราว์เซอร์ method = 'POST' หรือ 'PATCH' คืนค่า { ok, data }
// ห้ามตั้ง Content-Type เอง เบราว์เซอร์จะใส่ boundary ให้
export async function sendForm(method, path, formData) {
  const res = await fetch(`${API_URL}${path}`, { method, credentials: 'include', body: formData });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// ที่อยู่รูปของหาย (เก็บใน DB เป็นชื่อไฟล์) ไม่มีรูป = null
export function itemImageUrl(name) {
  return name ? `${API_URL}/uploads/items/${name}` : null;
}

// ตรวจไฟล์รูปก่อนส่ง (backend ตรวจซ้ำอีกชั้น) คืนข้อความ error หรือ '' ถ้าผ่าน/ไม่ได้เลือก
export function checkImage(file) {
  if (!file || !file.size) return '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'รองรับเฉพาะไฟล์ JPG, PNG, WebP';
  if (file.size > 5 * 1024 * 1024) return 'รูปต้องมีขนาดไม่เกิน 5 MB';
  return '';
}

// ที่อยู่รูปหลักฐานส่งมอบ/โต้แย้ง (ดูได้เฉพาะ officer/admin ที่ล็อกอิน) ไม่มีรูป = null
export function evidenceImageUrl(name) {
  return name ? `${API_URL}/api/returns/images/${name}` : null;
}
