'use client';
import { useState } from 'react';
import Link from 'next/link';
import { postJson } from '../../lib/api';

export default function ResetPasswordPage() {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    if (form.get('password') !== form.get('confirmPassword')) {
      return setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
    }
    // โทเค็นอยู่ใน URL (?token=...) ที่มาจากลิงก์ในอีเมล
    const token = new URLSearchParams(window.location.search).get('token');
    const { ok, data } = await postJson('/api/auth/reset-password', { token, password: form.get('password') });
    if (!ok) return setError(data.error || 'ตั้งรหัสผ่านไม่สำเร็จ');
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ตั้งรหัสผ่านใหม่</h1>
      {done ? (
        <p className="mt-4 text-green-700">
          ตั้งรหัสผ่านใหม่แล้ว <Link href="/login" className="text-blue-600 underline">เข้าสู่ระบบ</Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input name="password" type="password" required minLength={8} placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" className="w-full rounded border px-3 py-2" />
          <input name="confirmPassword" type="password" required minLength={8} placeholder="ยืนยันรหัสผ่านใหม่" className="w-full rounded border px-3 py-2" />
          {error && (
            <p className="text-sm text-red-600">
              {error} {error.includes('หมดอายุ') && <Link href="/forgot-password" className="underline">ขอลิงก์ใหม่</Link>}
            </p>
          )}
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">บันทึกรหัสผ่านใหม่</button>
        </form>
      )}
    </main>
  );
}
