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

  if (profile === null) return <main className="mx-auto max-w-xl px-6 py-8 text-sm text-slate-500">กำลังโหลด...</main>;
  if (profile === false) {
    return <main className="mx-auto max-w-xl px-6 py-8 text-sm text-slate-500">กรุณาเข้าสู่ระบบก่อน</main>;
  }

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-xl space-y-4 px-6 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl font-bold text-accent">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand">จัดการบัญชี</h1>
            <p className="text-xs text-slate-500">{profile.name}</p>
          </div>
        </div>

        {mode === 'view' && (
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">ชื่อ</span>
              <span className="font-semibold text-brand">{profile.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">อีเมล</span>
              <span className="font-mono text-xs text-brand">{profile.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">เบอร์ติดต่อ</span>
              <span className="font-semibold text-brand">{profile.contact || '-'}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={startEdit} className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">แก้ไขข้อมูล</button>
              <button onClick={startPassword} className="cursor-pointer rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">เปลี่ยนรหัสผ่าน</button>
            </div>
          </div>
        )}

        {mode === 'edit' && (
          <form onSubmit={saveProfile} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">ชื่อ-นามสกุล</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อ-นามสกุล"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">เบอร์ติดต่อ</label>
            <input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="เบอร์ติดต่อ"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
            <div className="flex gap-2">
              <button type="submit" className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">บันทึก</button>
              <button type="button" onClick={() => setMode('view')} className="cursor-pointer rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">ยกเลิก</button>
            </div>
          </form>
        )}

        {mode === 'password' && (
          <form onSubmit={changePassword} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">รหัสผ่านปัจจุบัน</label>
            <input type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              placeholder="รหัสผ่านปัจจุบัน"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">รหัสผ่านใหม่</label>
            <input type="password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">ยืนยันรหัสผ่านใหม่</label>
            <input type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              placeholder="ยืนยันรหัสผ่านใหม่"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
            <div className="flex gap-2">
              <button type="submit" className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">เปลี่ยนรหัสผ่าน</button>
              <button type="button" onClick={() => setMode('view')} className="cursor-pointer rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">ยกเลิก</button>
            </div>
          </form>
        )}
      </div>

      {msg && (
        <p className={`rounded-xl border p-3 text-xs font-semibold ${msg === 'เปลี่ยนรหัสผ่านแล้ว' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {msg}
        </p>
      )}
    </main>
  );
}
