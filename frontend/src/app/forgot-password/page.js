'use client';
import { useState } from 'react';
import Link from 'next/link';
import { postJson } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    const form = new FormData(e.target);
    const { ok, data } = await postJson('/api/auth/forgot-password', { email: form.get('email') });
    if (!ok) return setError(data.error || 'ส่งคำขอไม่สำเร็จ');
    setMessage(data.message);
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ลืมรหัสผ่าน</h1>
      <p className="text-sm text-gray-500">กรอกอีเมล RU Mail ที่สมัครไว้ เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้ (ลิงก์หมดอายุใน 30 นาที)</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input name="email" type="email" required placeholder="อีเมล RU Mail" className="w-full rounded border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ส่งลิงก์</button>
      </form>
      <Link href="/login" className="mt-4 inline-block text-sm text-blue-600 underline">กลับไปเข้าสู่ระบบ</Link>
    </main>
  );
}
