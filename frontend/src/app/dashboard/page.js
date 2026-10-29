'use client';
import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJson } from '../../lib/api';

// ปุ่มลัด: roles ไม่ระบุ = officer และ admin เห็นทั้งคู่
const SHORTCUTS = [
  { href: '/lost-items/new', label: 'ลงทะเบียนของหาย' },
  { href: '/lost-items', label: 'จัดการของหาย' },
  { href: '/returns', label: 'ยืนยันการส่งมอบ' },
  { href: '/broadcast', label: 'ประชาสัมพันธ์' },
  { href: '/admin/users', label: 'จัดการผู้ใช้/Role', adminOnly: true },
];

// การ์ดสรุปจำนวนของแต่ละสถานะ
const STATUS_CARDS = [
  { key: 'found', label: 'รอรับคืน' },
  { key: 'returned', label: 'คืนแล้ว' },
  { key: 'disputed', label: 'มีข้อโต้แย้ง' },
];

export default function DashboardPage() {
  const allowed = useRequireRole(['officer', 'admin']);
  const [user, setUser] = useState(null);
  const [items, setItems] = useState(null); // null = กำลังโหลด
  const [error, setError] = useState('');

  useEffect(() => {
    getJson('/api/auth/me').then(({ ok, data }) => ok && setUser(data.user));
    getJson('/api/lost-items')
      .then(({ ok, data }) => {
        if (ok) setItems(data.items);
        else setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
      })
      .catch(() => setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
  }, []);

  const count = (status) => items.filter((i) => i.status === status).length;

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">แดชบอร์ด{user ? ` – ${user.name}` : ''}</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {items && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {STATUS_CARDS.map((c) => (
            <div key={c.key} className="rounded border p-4 text-center">
              <p className="text-3xl font-bold">{count(c.key)}</p>
              <p className="text-sm text-gray-600">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        {SHORTCUTS.filter((s) => !s.adminOnly || user?.role === 'admin').map((s) => (
          <Link key={s.href} href={s.href} className="rounded border p-4 hover:bg-gray-100">
            {s.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
