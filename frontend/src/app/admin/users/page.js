'use client';
import useRequireRole from '../../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import { getJson, patchJson } from '../../../lib/api';

export default function AdminUsersPage() {
  const allowed = useRequireRole(['admin']);
  const [users, setUsers] = useState(null); // null = กำลังโหลด
  const [error, setError] = useState('');

  useEffect(() => {
    getJson('/api/users')
      .then(({ ok, data }) => {
        if (ok) setUsers(data.users);
        else setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
      })
      .catch(() => setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
  }, []);

  async function changeRole(id, role) {
    setError('');
    const { ok, data } = await patchJson(`/api/users/${id}/role`, { role });
    if (!ok) return setError(data.error || 'เปลี่ยน role ไม่สำเร็จ');
    setUsers((list) => list.map((u) => (u.id === id ? data.user : u)));
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-brand">จัดการผู้ใช้ / กำหนด Role</h1>
        <p className="text-xs text-slate-500">ตั้งผู้ใช้เป็น user หรือ officer (บัญชี admin เปลี่ยนไม่ได้)</p>
      </div>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
      {!error && users === null && <p className="text-sm text-slate-500">กำลังโหลด...</p>}
      {users && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-accent">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand">{u.name}</p>
                  <p className="font-mono text-xs text-slate-500">{u.email}</p>
                </div>
              </div>
              {u.role === 'admin' ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">🛡️ admin</span>
              ) : (
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="user">user</option>
                  <option value="officer">officer</option>
                </select>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
