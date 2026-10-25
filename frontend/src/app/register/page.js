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
    const { ok, data } = await postJson('/api/auth/register', {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
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
        <input name="name" required placeholder="ชื่อ-นามสกุล" className="w-full rounded border px-3 py-2" />
        <input name="email" type="email" required placeholder="อีเมล RU Mail" className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" required minLength={8} placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" className="w-full rounded border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ลงทะเบียน</button>
      </form>
    </main>
  );
}
