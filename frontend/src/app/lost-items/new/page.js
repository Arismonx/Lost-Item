'use client';
import useRequireRole from '../../../lib/useRequireRole';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendForm, checkImage } from '../../../lib/api';

export default function NewLostItemPage() {
  const allowed = useRequireRole(['officer', 'admin']);
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    const imageError = checkImage(form.get('image'));
    if (imageError) return setError(imageError);
    const { ok, data } = await sendForm('POST', '/api/lost-items', form);
    if (!ok) return setError(data.error || 'บันทึกไม่สำเร็จ');
    router.push('/lost-items');
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold text-brand">ลงทะเบียนของหาย</h1>
      <p className="mb-4 text-xs text-slate-500">บันทึกแล้วระบบจะสร้างประชาสัมพันธ์ให้อัตโนมัติ</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">ชื่อของ</label>
          <input name="name" required placeholder="เช่น กระเป๋าสตางค์สีดำ" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">วันที่พบ</label>
            <input name="found_date" type="date" required className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">สถานที่พบ</label>
            <input name="location" required placeholder="อาคาร หรือ ห้อง" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">รายละเอียดเพิ่มเติม</label>
          <textarea name="detail" rows={3} placeholder="จุดสังเกต สี ยี่ห้อ ฯลฯ" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">รูปภาพ (ไม่บังคับ, JPG/PNG/WebP ไม่เกิน 5 MB)</label>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold hover:file:bg-slate-200" />
        </div>
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
        <button type="submit" className="w-full cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">บันทึก</button>
      </form>
    </main>
  );
}
