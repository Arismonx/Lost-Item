'use client';
import { useEffect } from 'react';
import { postJson } from '../../lib/api';

export default function LogoutPage() {
  // เปิดหน้านี้แล้วออกจากระบบทันที จากนั้นกลับหน้าแรก
  useEffect(() => {
    postJson('/api/auth/logout', {}).then(() => {
      window.location.replace('/'); // โหลดหน้าใหม่ทั้งหมด เพื่อไม่ให้หน้าอื่นค้างสถานะของผู้ใช้เดิม
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="text-gray-500">กำลังออกจากระบบ...</p>
    </main>
  );
}
