'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// roles: ระบุ role ที่เห็นเมนูนี้ (ไม่ระบุ = ทุกคน), guest = ยังไม่ล็อกอิน/บุคคลภายนอก
const MENUS = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/broadcast', label: 'ประชาสัมพันธ์' }, // UC_08
  { href: '/contact', label: 'ติดต่อเจ้าหน้าที่' }, // UC_07
  { href: '/search', label: 'ค้นหาของหาย', roles: ['user', 'officer', 'admin'] }, // UC_06
  { href: '/lost-items/new', label: 'ลงทะเบียนของหาย', roles: ['officer', 'admin'] }, // UC_04
  { href: '/lost-items', label: 'จัดการของหาย', roles: ['officer', 'admin'] }, // UC_05
  { href: '/returns', label: 'ยืนยันการส่งมอบ', roles: ['officer', 'admin'] }, // UC_09
  { href: '/admin/users', label: 'จัดการผู้ใช้/Role', roles: ['admin'] }, // UC_03 (Admin)
];

// user = { name, role: 'user' | 'officer' | 'admin' } หรือ null เมื่อยังไม่ล็อกอิน
export default function Navbar({ user = null }) {
  const pathname = usePathname();
  const role = user?.role ?? 'guest';
  const items = MENUS.filter((m) => !m.roles || m.roles.includes(role));

  const linkClass = (href) =>
    `px-3 py-2 rounded-md text-sm ${
      pathname === href ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
    }`;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
      <div className="flex flex-wrap items-center gap-1">
        <Link href="/" className="mr-3 font-bold">
          ของหายได้คืน
        </Link>
        {items.map((m) => (
          <Link key={m.href} href={m.href} className={linkClass(m.href)}>
            {m.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {user ? (
          <>
            <Link href="/account" className={linkClass('/account')}>
              จัดการบัญชี ({user.name})
            </Link>
            <Link href="/logout" className={linkClass('/logout')}>
              ออกจากระบบ
            </Link>
          </>
        ) : (
          <>
            <Link href="/register" className={linkClass('/register')}>
              ลงทะเบียน
            </Link>
            <Link href="/login" className={linkClass('/login')}>
              เข้าสู่ระบบ
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
