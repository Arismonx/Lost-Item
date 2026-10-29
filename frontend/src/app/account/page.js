'use client';

import useRequireRole from '../../lib/useRequireRole';
import { useEffect, useState } from 'react';
import { getJson, patchJson } from '../../lib/api';

const EMPTY_PW = { currentPassword: '', newPassword: '', confirm: '' };

export default function AccountPage() {
  const allowed = useRequireRole();
  const [profile, setProfile] = useState(null);
  // โหมดของหน้า: 'view' (ดูอย่างเดียว) | 'edit' (แก้ข้อมูล) | 'password' (เปลี่ยนรหัสผ่าน)
  const [mode, setMode] = useState('view');
  const [form, setForm] = useState({ name: '', contact: '' });
  const [pw, setPw] = useState(EMPTY_PW);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getJson('/api/auth/profile').then(({ ok, data }) => {
      setProfile(ok ? data.user : false);
    });
  }, []);

  function startEdit() {
    setForm({ name: profile.name, contact: profile.contact || '' });
    setMsg('');
    setMode('edit');
  }

  function startPassword() {
    setPw(EMPTY_PW);
    setMsg('');
    setMode('password');
  }

  async function saveProfile(e) {
    e.preventDefault();
    const { ok, data } = await patchJson('/api/auth/profile', form);
    if (!ok) {
      setMsg(data.error || 'บันทึกไม่สำเร็จ');
      return;
    }
    window.location.reload(); // ให้ Navbar แสดงชื่อใหม่
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      setMsg('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    const { ok, data } = await patchJson('/api/auth/password', {
      currentPassword: pw.currentPassword,
      newPassword: pw.newPassword,
    });
    if (!ok) {
      setMsg(data.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      return;
    }
    setMode('view');
    setMsg('เปลี่ยนรหัสผ่านแล้ว');
  }

  if (profile === null) return <main className="mx-auto max-w-3xl p-6">กำลังโหลด...</main>;
  if (profile === false) {
    return <main className="mx-auto max-w-3xl p-6">กรุณาเข้าสู่ระบบก่อน</main>;
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">จัดการบัญชี</h1>

      {mode === 'view' && (
        <div className="mt-4 space-y-2">
          <p>ชื่อ: {profile.name}</p>
          <p>อีเมล: {profile.email}</p>
          <p>เบอร์ติดต่อ: {profile.contact || '-'}</p>
          <div className="flex gap-2 pt-2">
            <button onClick={startEdit} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              แก้ไขข้อมูล
            </button>
            <button onClick={startPassword} className="rounded border px-4 py-2 hover:bg-gray-100">
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <form onSubmit={saveProfile} className="mt-4 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ชื่อ-นามสกุล"
            className="w-full rounded border px-3 py-2"
          />
          <input
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="เบอร์ติดต่อ"
            className="w-full rounded border px-3 py-2"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              บันทึก
            </button>
            <button type="button" onClick={() => setMode('view')} className="rounded border px-4 py-2 hover:bg-gray-100">
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {mode === 'password' && (
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <input
            type="password"
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            placeholder="รหัสผ่านปัจจุบัน"
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="password"
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="password"
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            placeholder="ยืนยันรหัสผ่านใหม่"
            className="w-full rounded border px-3 py-2"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              เปลี่ยนรหัสผ่าน
            </button>
            <button type="button" onClick={() => setMode('view')} className="rounded border px-4 py-2 hover:bg-gray-100">
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </main>
  );
}
