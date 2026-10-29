'use client';
import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJson } from '../../lib/api';

// ชื่อสถานะที่แสดงบนหน้าเว็บ
const STATUS_TEXT = {
  lost: 'แจ้งหาย',
  found: 'รอรับคืน',
  returned: 'คืนแล้ว',
  disputed: 'มีข้อโต้แย้ง',
};

export default function LostItemsPage() {
  const allowed = useRequireRole(['officer', 'admin']);
  const [items, setItems] = useState(null); // null = กำลังโหลด
  const [error, setError] = useState('');

  useEffect(() => {
    getJson('/api/lost-items')
      .then(({ ok, data }) => {
        if (ok) setItems(data.items);
        else setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
      })
      .catch(() => setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
  }, []);

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการของหาย</h1>
        <Link href="/lost-items/new" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+ เพิ่ม</Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!error && items === null && <p className="mt-4 text-gray-500">กำลังโหลด...</p>}
      {items && items.length === 0 && <p className="mt-4 text-gray-500">ยังไม่มีของหายในระบบ</p>}
      {items && items.length > 0 && (
        <table className="mt-4 w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th>ชื่อ</th>
              <th>สถานที่</th>
              <th>วันที่พบ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2">{i.id}</td>
                <td>{i.name}</td>
                <td>{i.location}</td>
                <td>{i.found_date}</td>
                <td>{STATUS_TEXT[i.status] || i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
