'use client';
import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJson, itemImageUrl } from '../../lib/api';

// ปุ่มลัด: adminOnly = เฉพาะแอดมิน นอกนั้น officer และ admin เห็นทั้งคู่
const SHORTCUTS = [
  { href: '/lost-items/new', label: 'ลงทะเบียนของหาย', icon: '➕', color: 'bg-amber-50' },
  { href: '/lost-items', label: 'จัดการของหาย', icon: '📦', color: 'bg-sky-50' },
  { href: '/returns', label: 'ยืนยันการส่งมอบ', icon: '🤝', color: 'bg-emerald-50' },
  { href: '/broadcast', label: 'ประชาสัมพันธ์', icon: '📢', color: 'bg-purple-50' },
  { href: '/admin/users', label: 'จัดการผู้ใช้/Role', icon: '🛡️', color: 'bg-rose-50', adminOnly: true },
];

// การ์ดสรุปจำนวนของแต่ละสถานะ
const STATUS_CARDS = [
  { key: 'found', label: 'รอรับคืน', color: 'text-amber-600', bar: 'bg-amber-500' },
  { key: 'returned', label: 'คืนแล้ว', color: 'text-emerald-600', bar: 'bg-emerald-500' },
  { key: 'disputed', label: 'มีข้อโต้แย้ง', color: 'text-rose-600', bar: 'bg-rose-500' },
];

const STATUS_TEXT = { found: 'รอรับคืน', returned: 'คืนแล้ว', disputed: 'มีข้อโต้แย้ง' };

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
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-brand via-[#003d66] to-brand p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -bottom-10 -right-6 select-none text-9xl font-black opacity-10">RU</div>
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-brand">
            {user?.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : '🧑‍💼 เจ้าหน้าที่'}
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            แดชบอร์ด{user ? ` – ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-200">สรุปสถานะของหายและทางลัดสำหรับเจ้าหน้าที่</p>
        </div>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}

      {items && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATUS_CARDS.map((c) => (
            <div key={c.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className={`h-1.5 ${c.bar}`} />
              <div className="p-5">
                <p className={`text-4xl font-black ${c.color}`}>{count(c.key)}</p>
                <p className="mt-1 text-sm text-slate-600">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-brand">ทางลัด</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {SHORTCUTS.filter((s) => !s.adminOnly || user?.role === 'admin').map((s) => (
            <Link key={s.href} href={s.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl ${s.color}`}>{s.icon}</div>
              <p className="text-sm font-bold text-brand">{s.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {items && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold text-brand">ของหายล่าสุด</h2>
            <Link href="/lost-items" className="text-xs font-bold text-brand hover:text-amber-600">ดูทั้งหมด ›</Link>
          </div>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {items.slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {i.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={itemImageUrl(i.image)} alt={i.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brand">{i.name}</p>
                  <p className="truncate text-xs text-slate-500">{i.location} · {i.found_date}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  {STATUS_TEXT[i.status] || i.status}
                </span>
              </li>
            ))}
            {items.length === 0 && <li className="p-8 text-center text-sm text-slate-500">ยังไม่มีของหายในระบบ</li>}
          </ul>
        </section>
      )}
    </main>
  );
}
