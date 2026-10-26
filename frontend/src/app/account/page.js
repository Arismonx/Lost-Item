'use client';

import { useEffect, useState } from 'react';
import { getJson, patchJson } from '../../lib/api';

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [profileMsg, setProfileMsg] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    getJson('/api/auth/profile').then(({ ok, data }) => {
      setProfile(ok ? data.user : false);
    });
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    const { ok, data } = await patchJson('/api/auth/profile', {
      name: profile.name,
      contact: profile.contact,
    });
    setProfileMsg(ok ? 'บันทึกแล้ว' : data.error || 'บันทึกไม่สำเร็จ');
    if (ok) window.location.reload(); // ให้ Navbar แสดงชื่อใหม่
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      setPwMsg('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    const { ok, data } = await patchJson('/api/auth/password', {
      currentPassword: pw.currentPassword,
      newPassword: pw.newPassword,
    });
    setPwMsg(ok ? 'เปลี่ยนรหัสผ่านแล้ว' : data.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    if (ok) setPw({ currentPassword: '', newPassword: '', confirm: '' });
  }

  if (profile === null) return <main className="mx-auto max-w-3xl p-6">กำลังโหลด...</main>;
  if (profile === false) {
    return <main className="mx-auto max-w-3xl p-6">กรุณาเข้าสู่ระบบก่อน</main>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">จัดการบัญชี</h1>

      <form onSubmit={saveProfile} className="mt-4 space-y-3">
        <input value={profile.email} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
        <input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="ชื่อ-นามสกุล"
          className="w-full rounded border px-3 py-2"
        />
        <input
          value={profile.contact || ''}
          onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
          placeholder="เบอร์ติดต่อ"
          className="w-full rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          บันทึก
        </button>
        {profileMsg && <p className="text-sm">{profileMsg}</p>}
      </form>

      <h2 className="mt-8 text-xl font-bold">เปลี่ยนรหัสผ่าน</h2>
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
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          เปลี่ยนรหัสผ่าน
        </button>
        {pwMsg && <p className="text-sm">{pwMsg}</p>}
      </form>
    </main>
  );
}
