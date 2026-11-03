'use client';
import { useEffect, useState } from 'react';
import { getJson, postJson, deleteJson, itemImageUrl } from '../../lib/api';

export default function BroadcastPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  function load() {
    getJson('/api/broadcasts').then(({ ok, data }) => ok && setPosts(data.broadcasts));
  }

  useEffect(() => {
    getJson('/api/broadcasts').then(({ ok, data }) => ok && setPosts(data.broadcasts));
    getJson('/api/auth/me').then(({ ok, data }) => ok && setUser(data.user));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    const { ok, data } = await postJson('/api/broadcasts', {
      title: form.get('title'),
      description: form.get('description'),
      item_id: form.get('item_id'),
    });
    if (!ok) return setError(data.error || 'ส่งประชาสัมพันธ์ไม่สำเร็จ');
    e.target.reset();
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('ลบประชาสัมพันธ์นี้?')) return;
    const { ok, data } = await deleteJson(`/api/broadcasts/${id}`);
    if (!ok) return setError(data.error || 'ลบไม่สำเร็จ');
    setPosts((list) => list.filter((p) => p.id !== id));
  }

  const isStaff = user && (user.role === 'officer' || user.role === 'admin');

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand">ประชาสัมพันธ์</h1>
          <p className="text-xs text-slate-500">ประกาศข่าวสารสิ่งของสูญหายประจำภาควิชาวิทยาการคอมพิวเตอร์</p>
        </div>
        {isStaff && !showForm && (
          <button onClick={() => setShowForm(true)} className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">
            + เพิ่มประชาสัมพันธ์
          </button>
        )}
      </div>

      {isStaff && showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <input name="title" required placeholder="หัวข้อ" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
          <textarea name="description" placeholder="รายละเอียด" rows={3} className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
          <input name="item_id" type="number" placeholder="รหัสของหาย (ไม่บังคับ)" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">ส่งประชาสัมพันธ์</button>
            <button type="button" onClick={() => setShowForm(false)} className="cursor-pointer rounded-xl border border-slate-300 px-5 py-2.5 text-sm hover:bg-slate-50">ยกเลิก</button>
          </div>
        </form>
      )}

      {error && !showForm && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}

      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">ประกาศ</span>
              <span className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString('th-TH')}</span>
            </div>
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={itemImageUrl(p.image)} alt={p.title} className="mb-3 max-h-64 rounded-xl object-cover" />
            )}
            <h2 className="text-base font-bold text-brand">{p.title}</h2>
            {p.description && <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.description}</p>}
            {isStaff && (
              <button onClick={() => handleDelete(p.id)} className="mt-3 cursor-pointer rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                ลบ
              </button>
            )}
          </li>
        ))}
        {posts.length === 0 && <li className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">ยังไม่มีประชาสัมพันธ์</li>}
      </ul>
    </main>
  );
}
