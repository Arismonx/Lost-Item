'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
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
    router.push('/'); // สมัครเสร็จล็อกอินให้เลย
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ลงทะเบียน</h1>
      <p className="text-sm text-gray-500">ใช้ได้เฉพาะอีเมล RU Mail เท่านั้น</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex gap-3">
          <input name="firstName" required placeholder="ชื่อ" className="w-full rounded border px-3 py-2" />
          <input name="lastName" required placeholder="นามสกุล" className="w-full rounded border px-3 py-2" />
        </div>
        <input name="email" type="email" required placeholder="อีเมล RU Mail" className="w-full rounded border px-3 py-2" />
        <input name="contact" required placeholder="ช่องทางติดต่อ (เบอร์โทร / LINE)" className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" required minLength={8} placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" className="w-full rounded border px-3 py-2" />
        <input name="confirmPassword" type="password" required minLength={8} placeholder="ยืนยันรหัสผ่าน" className="w-full rounded border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ลงทะเบียน</button>
      </form>
    </main>
  );
}
