'use client';
import { useState } from 'react';
import Link from 'next/link';
import { postJson } from '../../lib/api';

export default function RegisterPage() {
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    if (form.get('password') !== form.get('confirmPassword')) {
      return setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
    }
    const { ok, data } = await postJson('/api/auth/register', {
      name: `${form.get('firstName').trim()} ${form.get('lastName').trim()}`, // รวมเป็นช่องเดียวตาม DB
      email: form.get('email'),
      password: form.get('password'),
      contact: form.get('contact'),
    });
    if (!ok) return setError(data.error || 'ลงทะเบียนไม่สำเร็จ');
    window.location.assign(String(new URL('/', window.location.origin))); // สมัครเสร็จล็อกอินให้เลย โหลดหน้าใหม่ทั้งหมดให้ Navbar อัปเดต
  }

  return (
    <main className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-center text-xl font-bold text-brand">ลงทะเบียนใช้งานระบบ</h1>
      <p className="mb-4 text-center text-xs text-slate-500">ใช้ได้เฉพาะอีเมล RU Mail เท่านั้น</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <input name="firstName" required placeholder="ชื่อ" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
          <input name="lastName" required placeholder="นามสกุล" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <input name="email" type="email" required placeholder="อีเมล RU Mail (@rumail.ru.ac.th)" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        <input name="contact" required placeholder="ช่องทางติดต่อ (เบอร์โทร / LINE)" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        <input name="password" type="password" required minLength={8} placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        <input name="confirmPassword" type="password" required minLength={8} placeholder="ยืนยันรหัสผ่าน" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
        <button type="submit" className="w-full cursor-pointer rounded-xl bg-brand py-3 font-bold text-white shadow transition hover:bg-[#001c30]">ยืนยันการสมัคร</button>
        <Link href="/login" className="inline-block text-xs font-semibold text-brand hover:underline">
          ← กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </form>
    </main>
  );
}
