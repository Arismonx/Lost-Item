'use client';
import useRequireRole from '../../../lib/useRequireRole';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '../../../lib/api';

export default function NewLostItemPage() {
  const allowed = useRequireRole(['officer', 'admin']);
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    const { ok, data } = await postJson('/api/lost-items', {
      name: form.get('name'),
      found_date: form.get('found_date'),
      location: form.get('location'),
      detail: form.get('detail'),
    });
    if (!ok) return setError(data.error || 'บันทึกไม่สำเร็จ');
    router.push('/lost-items');
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ลงทะเบียนของหาย</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input name="name" required placeholder="ชื่อของ" className="w-full rounded border px-3 py-2" />
        <input name="found_date" type="date" required className="w-full rounded border px-3 py-2" />
        <input name="location" required placeholder="สถานที่พบ" className="w-full rounded border px-3 py-2" />
        <textarea name="detail" placeholder="รายละเอียดเพิ่มเติม" className="w-full rounded border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">บันทึก</button>
      </form>
    </main>
  );
}
