'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '../../lib/api';

export default function LogoutPage() {
  const router = useRouter();

  // เปิดหน้านี้แล้วออกจากระบบทันที จากนั้นกลับหน้าแรก
  useEffect(() => {
    postJson('/api/auth/logout', {}).then(() => {
      router.replace('/');
      router.refresh();
    });
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="text-gray-500">กำลังออกจากระบบ...</p>
    </main>
  );
}
