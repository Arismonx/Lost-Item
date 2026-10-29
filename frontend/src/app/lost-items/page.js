'use client';
import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJson, patchJson } from '../../lib/api';

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
    setForm({ name: i.name, location: i.location, found_date: i.found_date, detail: i.detail || '' });
  }

  async function saveEdit() {
    setError('');
    const { ok, data } = await patchJson(`/api/lost-items/${editId}`, form);
    if (!ok) return setError(data.error || 'บันทึกไม่สำเร็จ');
    setItems((list) => list.map((i) => (i.id === editId ? data.item : i)));
    setEditId(null);
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการของหาย</h1>
        <Link href="/lost-items/new" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+ เพิ่ม</Link>
      </div>
      {error && !editId && <p className="mt-4 text-sm text-red-600">{error}</p>}
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
              <th></th>
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
                <td>
                  {i.status === 'found' && (
                    <button onClick={() => startEdit(i)} className="rounded border px-3 py-1 hover:bg-gray-100">แก้ไข</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditId(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); saveEdit(); }}
            className="w-full max-w-md space-y-3 rounded bg-white p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold">แก้ไขของหาย (ID {editId})</h2>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อของ" className="w-full rounded border px-3 py-2" />
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="สถานที่พบ" className="w-full rounded border px-3 py-2" />
            <input required type="date" value={form.found_date} onChange={(e) => setForm({ ...form, found_date: e.target.value })} className="w-full rounded border px-3 py-2" />
            <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="รายละเอียด" rows={3} className="w-full rounded border px-3 py-2" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditId(null)} className="rounded border px-4 py-2">ยกเลิก</button>
              <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">บันทึก</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
