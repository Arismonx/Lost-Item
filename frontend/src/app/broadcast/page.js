'use client';
import { useEffect, useState } from 'react';
import { getJson, postJson, itemImageUrl } from '../../lib/api';

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

  const isStaff = user && (user.role === 'officer' || user.role === 'admin');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ประชาสัมพันธ์</h1>

      {isStaff && !showForm && (
        <button onClick={() => setShowForm(true)} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + เพิ่มประชาสัมพันธ์
        </button>
      )}

      {isStaff && showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded border p-3">
          <input name="title" required placeholder="หัวข้อ" className="w-full rounded border px-3 py-2" />
          <textarea name="description" placeholder="รายละเอียด" className="w-full rounded border px-3 py-2" />
          <input name="item_id" type="number" placeholder="รหัสของหาย (ไม่บังคับ)" className="w-full rounded border px-3 py-2" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ส่งประชาสัมพันธ์</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded border px-4 py-2 hover:bg-gray-50">ยกเลิก</button>
          </div>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="rounded border p-3">
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={itemImageUrl(p.image)} alt={p.title} className="mb-2 max-h-48 rounded object-cover" />
            )}
            <div className="font-medium">{p.title}</div>
            {p.description && <p className="mt-1 text-sm">{p.description}</p>}
            <div className="text-sm text-gray-500">
              {new Date(p.created_at).toLocaleDateString('th-TH')}
            </div>
          </li>
        ))}
        {posts.length === 0 && <li className="text-gray-500">ยังไม่มีประชาสัมพันธ์</li>}
      </ul>
    </main>
  );
}
