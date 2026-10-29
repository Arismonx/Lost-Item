'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    const { ok, data } = await postJson('/api/auth/login', {
      email: form.get('email'),
      password: form.get('password'),
    });
    if (!ok) return setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
    // officer/admin ไปแดชบอร์ด คนอื่นไปหน้าแรก
    router.push(['officer', 'admin'].includes(data.user.role) ? '/dashboard' : '/');
    router.refresh(); // ให้ Navbar โหลดข้อมูลผู้ใช้ใหม่
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input name="email" type="email" required placeholder="อีเมล RU Mail" className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" required placeholder="รหัสผ่าน" className="w-full rounded border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">เข้าสู่ระบบ</button>
      </form>
    </main>
  );
}
