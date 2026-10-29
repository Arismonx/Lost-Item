'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJson } from './api';

// เช็คสิทธิ์ฝั่งหน้าเว็บ: ยังไม่ล็อกอิน -> /login, role ไม่ตรง -> /
// roles ไม่ระบุ = ขอแค่ล็อกอิน คืน true เมื่อผ่านแล้วเท่านั้น (ระหว่างตรวจให้แสดงหน้าว่างไปก่อน)
export default function useRequireRole(roles) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    getJson('/api/auth/me')
      .then(({ ok, data }) => {
        if (!ok) return router.replace('/login');
        if (roles && !roles.includes(data.user.role)) return router.replace('/');
        setAllowed(true);
      })
      .catch(() => router.replace('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return allowed;
}
