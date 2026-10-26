'use client';
import { useEffect, useState } from 'react';
import { getJson, patchJson } from '../../../lib/api';

export default function AdminUsersPage() {
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

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">จัดการผู้ใช้ / กำหนด Role</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!error && users === null && <p className="mt-4 text-gray-500">กำลังโหลด...</p>}
      {users && (
        <ul className="mt-4 space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded border p-3">
              <span>
                {u.name} <span className="text-sm text-gray-500">({u.email})</span>
              </span>
              {u.role === 'admin' ? (
                <span className="px-2 py-1 text-sm text-gray-500">admin</span>
              ) : (
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="rounded border px-2 py-1"
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
