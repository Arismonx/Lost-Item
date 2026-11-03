'use client';
import { useEffect, useState } from 'react';
import { getJson } from '../../lib/api';

// แก้ข้อความสถานที่/เวลารับของตรงนี้ให้ตรงกับของจริง
const PICKUP_PLACE = 'ภาควิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยรามคำแหง ชั้น 2 ห้องธุรการ';
const PICKUP_TIME = 'ติดต่อเจ้าหน้าที่ ณ เวลาทำการ: วันจันทร์ - วันศุกร์ เวลา 8:30 - 16:00 น.';

export default function ContactPage() {
  const [officers, setOfficers] = useState(null);
  const [itemName, setItemName] = useState(''); // ชื่อของจาก ?item= (มาจากปุ่มในหน้าค้นหา)

  useEffect(() => {
    getJson('/api/contact/officers').then(({ ok, data }) => {
      setItemName(new URLSearchParams(window.location.search).get('item') || '');
      setOfficers(ok ? data.officers : []);
    });
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-brand via-[#003d66] to-brand p-8 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -bottom-10 -right-6 select-none text-9xl font-black opacity-10">RU</div>
        <div className="relative z-10 max-w-2xl">
          <span className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-brand">
            🏛️ ภาควิชาวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์
          </span>
          <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">ติดต่อเจ้าหน้าที่</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            หากทำของหายหรือเก็บทรัพย์สินได้ นำส่งหรือติดต่อขอรับคืนได้ที่ห้องธุรการภาควิชา
            พร้อมนำบัตรประจำตัวมาแสดงต่อเจ้าหน้าที่
          </p>
        </div>
      </div>

      {itemName && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <div className="text-sm">
            คุณกำลังติดต่อเรื่อง: <span className="font-bold text-brand">{itemName}</span>
          </div>
          <p className="text-xs text-slate-600">กรุณาแจ้งชื่อของนี้กับเจ้าหน้าที่ และพกบัตรประจำตัวมาด้วย</p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">📍</div>
          <h2 className="text-sm font-bold text-brand">สถานที่รับของ</h2>
          <p className="mt-1 text-xs text-slate-600">{PICKUP_PLACE}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-xl">⏰</div>
          <h2 className="text-sm font-bold text-brand">เวลาทำการ</h2>
          <p className="mt-1 text-xs text-slate-600">{PICKUP_TIME}</p>
          <p className="mt-1 text-xs text-slate-400">โปรดนำบัตรประจำตัวมาเพื่อยืนยันความเป็นเจ้าของ</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-brand">รายชื่อเจ้าหน้าที่</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {officers?.map((o) => (
            <li key={o.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="text-sm font-bold text-brand">{o.name}</div>
              <div className="mt-1 text-xs text-slate-600">📞 {o.contact || '-'}</div>
              <div className="font-mono text-xs text-slate-600">✉️ {o.email}</div>
            </li>
          ))}
          {officers && officers.length === 0 && (
            <li className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 sm:col-span-2">
              ยังไม่มีรายชื่อเจ้าหน้าที่
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
