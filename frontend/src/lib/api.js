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
