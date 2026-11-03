'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getJson, itemImageUrl } from '../lib/api';

// ข้อความสถานที่/เวลา ให้ตรงกับหน้า /contact
const PICKUP_PLACE = 'ภาควิชาวิทยาการคอมพิวเตอร์ ชั้น 2 ห้องธุรการ';
const PICKUP_TIME = 'จันทร์ - ศุกร์ 8:30 - 16:00 น.';

const FEATURES = [
  { icon: '🛡️', title: 'ยืนยันตัวตน RU Mail', text: 'เฉพาะนักศึกษาและบุคลากร', color: 'bg-amber-50 text-amber-700' },
  { icon: '🔍', title: 'ค้นหาของหาย', text: 'ค้นจากชื่อ สถานที่ และรายละเอียด', color: 'bg-sky-50 text-sky-700' },
  { icon: '🤝', title: 'ส่งมอบคืนปลอดภัย', text: 'มีบันทึกและหลักฐานการส่งมอบ', color: 'bg-emerald-50 text-emerald-700' },
  { icon: '🏛️', title: 'จุดรับฝากของ', text: 'ห้องธุรการภาควิชา ชั้น 2', color: 'bg-purple-50 text-purple-700' },
];

const REASONS = [
  { icon: '📍', title: 'ค้นหาได้ตรงสถานที่', text: 'ระบุสถานที่ที่พบของได้ชัดเจน ไม่ต้องเดินถามหา' },
  { icon: '📷', title: 'มีรูปประกอบ', text: 'ดูรูปของที่พบ ช่วยยืนยันความเป็นเจ้าของ' },
  { icon: '📜', title: 'มีประวัติการส่งมอบ', text: 'บันทึกผู้รับและผู้ส่งมอบ ป้องกันการแอบอ้าง' },
  { icon: '📢', title: 'ประชาสัมพันธ์ในระบบ', text: 'ประกาศของที่พบให้ทุกคนรับทราบทันที' },
];

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getJson('/api/broadcasts').then(({ ok, data }) => ok && setPosts(data.broadcasts.slice(0, 4)));
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-6 py-8 pb-16">
      {/* 1. Hero */}
      <section className="relative flex min-h-[420px] items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand via-[#00385f] to-[#011627] text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative z-10 grid w-full grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-12 lg:gap-12 lg:p-14">
          <div className="space-y-5 lg:col-span-7">
            <span className="inline-flex items-center rounded-full bg-accent px-3.5 py-1.5 text-xs font-extrabold text-brand shadow-md">
              COS4101 ภาควิชาวิทยาการคอมพิวเตอร์
            </span>
            <h1 className="text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl">
              ตามหาของตกหล่น <br />
              <span className="bg-gradient-to-r from-accent via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                ส่งคืนสู่เจ้าของอย่างปลอดภัย
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-200">
              ระบบแจ้งและค้นหาของหาย คณะวิทยาศาสตร์ มหาวิทยาลัยรามคำแหง
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/search" className="rounded-2xl bg-accent px-6 py-3.5 text-sm font-black text-brand shadow-lg transition hover:bg-amber-400">
                🔍 ค้นหาของหาย →
              </Link>
              <Link href="/broadcast" className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20">
                📢 ดูประชาสัมพันธ์
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 lg:flex lg:justify-end">
            <div className="w-full max-w-sm space-y-4 rounded-3xl border border-white/20 bg-white/10 p-6 text-left shadow-2xl backdrop-blur-xl sm:p-7">
              <span className="inline-block rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand">
                จุดรับฝากส่วนกลาง
              </span>
              <div>
                <h2 className="text-lg font-black">ห้องธุรการวิทยาการคอมพิวเตอร์</h2>
                <p className="mt-1 text-xs text-slate-300">{PICKUP_PLACE}</p>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">🕒</span>
                <span>{PICKUP_TIME}</span>
              </div>
              <Link href="/contact" className="block w-full rounded-xl bg-white py-3 text-center text-xs font-extrabold text-brand shadow-lg transition hover:bg-amber-300">
                ติดต่อเจ้าหน้าที่ →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. จุดเด่น */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${f.color}`}>{f.icon}</div>
            <div>
              <h4 className="text-xs font-bold text-brand">{f.title}</h4>
              <p className="mt-0.5 text-[10px] text-slate-500">{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 3. แบนเนอร์แบ่งสองฝั่ง */}
      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="relative flex min-h-[260px] items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-brand to-brand-light p-8 text-white shadow-xl lg:col-span-6">
          <div className="max-w-sm space-y-3">
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
              ประกาศ
            </span>
            <h3 className="text-2xl font-black leading-tight">
              พบสิ่งของมีค่า <br />กรุณานำส่งที่ห้องธุรการ
            </h3>
            <p className="text-xs text-slate-200">
              โน้ตบุ๊ก แท็บเล็ต หรือกระเป๋าสตางค์ที่มีเงินสด ให้นำส่งเจ้าหน้าที่เพื่อลงบันทึกและเก็บรักษา
            </p>
            <Link href="/contact" className="inline-block rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand shadow transition hover:bg-amber-300">
              ติดต่อเจ้าหน้าที่ →
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-6">
          <div className="mb-4">
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              ABOUT SERVICE
            </span>
            <h3 className="mt-2 text-xl font-black text-brand">ทำไมต้องใช้ระบบออนไลน์?</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            {REASONS.map((r) => (
              <div key={r.title} className="space-y-1">
                <h4 className="flex items-center gap-1.5 font-bold text-brand">
                  <span>{r.icon}</span> {r.title}
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-500">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ประชาสัมพันธ์ล่าสุด */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-brand">ประชาสัมพันธ์ล่าสุด</h2>
            <p className="text-xs text-slate-400">ของที่เจ้าหน้าที่ประกาศไว้ในระบบ</p>
          </div>
          <Link href="/broadcast" className="text-xs font-bold text-brand hover:text-amber-600">
            ดูทั้งหมด ›
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((p) => (
              <article key={p.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:shadow-xl">
                <div className="h-44 w-full shrink-0 overflow-hidden bg-slate-100">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={itemImageUrl(p.image)} alt={p.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">📦</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col space-y-1.5 p-5">
                  <span className="text-[10px] text-slate-400">
                    📅 {new Date(p.created_at).toLocaleDateString('th-TH')}
                  </span>
                  <h3 className="line-clamp-1 text-sm font-extrabold text-brand">{p.title}</h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {p.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>
                  <Link href="/contact" className="!mt-auto pt-3 text-[11px] font-bold text-brand hover:text-amber-600">
                    ติดต่อรับคืน ›
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="text-4xl">📭</div>
            <p className="mt-2 text-sm text-slate-500">ยังไม่มีประชาสัมพันธ์</p>
          </div>
        )}
      </section>
    </main>
  );
}
