'use client';
import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteJson, getJson, sendForm, checkImage, itemImageUrl } from '../../lib/api';

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
  const [editId, setEditId] = useState(null); // แถวที่กำลังแก้ไข
  const [form, setForm] = useState({});

  useEffect(() => {
    getJson('/api/lost-items')
      .then(({ ok, data }) => {
        if (ok) setItems(data.items);
        else setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
      })
      .catch(() => setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
  }, []);

  function startEdit(i) {
    setError('');
    setEditId(i.id);
    setForm({ name: i.name, location: i.location, found_date: i.found_date, detail: i.detail || '', image: null, currentImage: i.image });
  }

  async function saveEdit() {
    setError('');
    const imageError = checkImage(form.image);
    if (imageError) return setError(imageError);
    const body = new FormData();
    ['name', 'location', 'found_date', 'detail'].forEach((k) => body.append(k, form[k]));
    if (form.image) body.append('image', form.image);
    const { ok, data } = await sendForm('PATCH', `/api/lost-items/${editId}`, body);
    if (!ok) return setError(data.error || 'บันทึกไม่สำเร็จ');
    setItems((list) => list.map((i) => (i.id === editId ? data.item : i)));
    setEditId(null);
  }

  async function handleDelete(i) {
    if (!confirm(`ลบ "${i.name}" ? (ประชาสัมพันธ์ที่ผูกอยู่จะถูกลบด้วย)`)) return;
    setError('');
    const { ok, data } = await deleteJson(`/api/lost-items/${i.id}`);
    if (!ok) return setError(data.error || 'ลบไม่สำเร็จ');
    setItems((list) => list.filter((x) => x.id !== i.id));
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand">จัดการของหาย</h1>
          <p className="text-xs text-slate-500">แก้ไขหรือลบได้เฉพาะของที่ยังรอรับคืน</p>
        </div>
        <Link href="/lost-items/new" className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">+ เพิ่ม</Link>
      </div>
      {error && !editId && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
      {!error && items === null && <p className="text-sm text-slate-500">กำลังโหลด...</p>}
      {items && items.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">ยังไม่มีของหายในระบบ</div>
      )}
      {items && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th>รูป</th>
                <th>ชื่อ</th>
                <th>สถานที่</th>
                <th>วันที่พบ</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{i.id}</td>
                  <td>
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={itemImageUrl(i.image)} alt={i.name} className="h-12 w-12 rounded-xl object-cover" />
                    )}
                  </td>
                  <td className="font-semibold text-brand">{i.name}</td>
                  <td className="text-slate-600">{i.location}</td>
                  <td className="text-slate-600">{i.found_date}</td>
                  <td>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {STATUS_TEXT[i.status] || i.status}
                    </span>
                  </td>
                  <td className="pr-4">
                    {i.status === 'found' && (
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(i)} className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50">แก้ไข</button>
                        <button onClick={() => handleDelete(i)} className="cursor-pointer rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">ลบ</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditId(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); saveEdit(); }}
            className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-brand">แก้ไขของหาย (ID {editId})</h2>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อของ" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="สถานที่พบ" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <input required type="date" value={form.found_date} onChange={(e) => setForm({ ...form, found_date: e.target.value })} className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="รายละเอียด" rows={3} className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
            {form.currentImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={itemImageUrl(form.currentImage)} alt="รูปปัจจุบัน" className="h-24 rounded object-cover" />
            )}
            <div>
              <label className="text-xs text-slate-500">{form.currentImage ? 'เปลี่ยนรูป (ไม่เลือก = ใช้รูปเดิม)' : 'รูปภาพ (ไม่บังคับ)'} JPG/PNG/WebP ไม่เกิน 5 MB</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })} className="mt-1 block w-full text-sm" />
            </div>
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditId(null)} className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">ยกเลิก</button>
              <button type="submit" className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">บันทึก</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
