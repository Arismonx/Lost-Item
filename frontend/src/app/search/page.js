'use client';
import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJson, itemImageUrl } from '../../lib/api';

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
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-brand">ค้นหาของหาย</h1>
        <p className="text-xs text-slate-500">ค้นจากชื่อของ สถานที่พบ หรือรายละเอียด</p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            name="q"
            placeholder="ชื่อของ หรือ สถานที่"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <button type="submit" className="cursor-pointer rounded-xl bg-brand px-6 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">
            ค้นหา
          </button>
        </form>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error} {error.includes('เข้าสู่ระบบ') && <Link href="/login" className="underline">เข้าสู่ระบบ</Link>}
        </p>
      )}
      {items && items.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="text-4xl">🔍</div>
          <p className="mt-2 text-sm text-slate-500">ไม่พบของหาย</p>
        </div>
      )}

      {items && items.length > 0 && (
        <p className="text-xs text-slate-400">พบ {items.length} รายการ</p>
      )}
      <ul className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items?.map((i) => (
          <li key={i.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:shadow-xl">
            <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-100">
              {i.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={itemImageUrl(i.image)} alt={i.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl">📦</div>
              )}
              <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                รอรับคืน
              </span>
            </div>
            <div className="flex flex-1 flex-col space-y-3 p-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-600">#{i.id}</span>
                  <span>📅 {i.found_date}</span>
                </div>
                <h2 className="line-clamp-1 text-sm font-extrabold text-brand">{i.name}</h2>
                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-500">
                  {i.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </p>
              </div>
              <div className="!mt-auto space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                  <span className="text-amber-500">📍</span>
                  <span className="truncate">พบที่ {i.location}</span>
                </div>
                <Link
                  href={`/contact?item=${encodeURIComponent(i.name)}`}
                  className="block rounded-xl bg-brand py-2 text-center text-xs font-bold text-white transition hover:bg-[#001c30]"
                >
                  ติดต่อรับของ →
                </Link>
                <p className="text-center text-[10px] text-slate-400">พกบัตรประจำตัวเพื่อยืนยันความเป็นเจ้าของ</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
