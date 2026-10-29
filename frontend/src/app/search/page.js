'use client';
import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJson } from '../../lib/api';

export default function SearchPage() {
  const allowed = useRequireRole(['user', 'officer', 'admin']);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  async function search(q) {
    const { ok, data } = await getJson(`/api/lost-items/search?q=${encodeURIComponent(q)}`);
    if (!ok) return setError(data.error || 'ค้นหาไม่สำเร็จ');
    setError('');
    setItems(data.items);
  }

  // โหลดรายการทั้งหมดตอนเปิดหน้า
  useEffect(() => {
    getJson('/api/lost-items/search?q=').then(({ ok, data }) => {
      if (ok) setItems(data.items);
      else setError(data.error || 'ค้นหาไม่สำเร็จ');
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    search(new FormData(e.target).get('q'));
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ค้นหาของหาย</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input name="q" placeholder="ชื่อของ หรือ สถานที่" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ค้นหา</button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error} {error.includes('เข้าสู่ระบบ') && <Link href="/login" className="underline">เข้าสู่ระบบ</Link>}
        </p>
      )}
      {items && items.length === 0 && <p className="mt-4 text-gray-500">ไม่พบของหาย</p>}
      <ul className="mt-4 space-y-2">
        {items?.map((i) => (
          <li key={i.id} className="rounded border p-3">
            <div className="font-medium">{i.name}</div>
            {i.detail && <p className="mt-1 text-sm">{i.detail}</p>}
            <div className="text-sm text-gray-500">พบที่ {i.location} · {i.found_date}</div>
            <Link
              href={`/contact?item=${encodeURIComponent(i.name)}`}
              className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              ติดต่อรับของ
            </Link>
            <p className="mt-1 text-xs text-gray-500">พกบัตรประจำตัวเพื่อยืนยันความเป็นเจ้าของ</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
