'use client';
import { useState } from 'react';
import Link from 'next/link';
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
    <main className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-4 text-center text-xl font-bold text-brand">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">อีเมล RU Mail</label>
          <input name="email" type="email" required placeholder="student@rumail.ru.ac.th" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">รหัสผ่าน</label>
          <input name="password" type="password" required placeholder="รหัสผ่าน" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
        <button type="submit" className="w-full cursor-pointer rounded-xl bg-brand py-3 font-bold text-white shadow transition hover:bg-[#001c30]">เข้าสู่ระบบ</button>
        <div className="pt-1 text-xs">
          <Link href="/register" className="font-semibold text-brand hover:underline">
            สมัครสมาชิกใหม่
          </Link>
        </div>
      </form>
    </main>
  );
}
