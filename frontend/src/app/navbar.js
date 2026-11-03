'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// roles: ระบุ role ที่เห็นเมนูนี้ (ไม่ระบุ = ทุกคน), guest = ยังไม่ล็อกอิน/บุคคลภายนอก
const MENUS = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/dashboard', label: 'แดชบอร์ด', roles: ['officer', 'admin'] },
  { href: '/broadcast', label: 'ประชาสัมพันธ์' }, // UC_08
  { href: '/contact', label: 'ติดต่อเจ้าหน้าที่' }, // UC_07
  { href: '/search', label: 'ค้นหาของหาย', roles: ['user', 'officer', 'admin'] }, // UC_06
  { href: '/lost-items/new', label: 'ลงทะเบียนของหาย', roles: ['officer', 'admin'] }, // UC_04
  { href: '/lost-items', label: 'จัดการของหาย', roles: ['officer', 'admin'] }, // UC_05
  { href: '/returns', label: 'การส่งมอบ', roles: ['officer', 'admin'] }, // UC_09
  { href: '/admin/users', label: 'จัดการผู้ใช้/Role', roles: ['admin'] }, // UC_03 (Admin)
];

// user = { name, role: 'user' | 'officer' | 'admin' } หรือ null เมื่อยังไม่ล็อกอิน
export default function Navbar({ user = null }) {
  const pathname = usePathname();
  const role = user?.role ?? 'guest';
  const items = MENUS.filter((m) => !m.roles || m.roles.includes(role));

  const linkClass = (href) =>
    `whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
      pathname === href
        ? 'bg-accent font-bold text-brand'
        : 'text-slate-200 hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex shrink-0 select-none items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/40 bg-gradient-to-tr from-brand to-brand-light shadow-lg">
            <svg className="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">ของหายได้คืน</span>
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold text-brand">COS4101</span>
            </div>
            <p className="text-xs text-slate-300">ภาควิชาวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1.5">
          {items.map((m) => (
            <Link key={m.href} href={m.href} className={linkClass(m.href)}>
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <Link href="/account" className={linkClass('/account')}>
                {user.name} ({user.role})
              </Link>
              <Link
                href="/logout"
                className="rounded-xl border border-rose-500/30 bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/30 hover:text-rose-200"
              >
                ออกจากระบบ
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass('/login')}>
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-accent px-3.5 py-1.5 text-xs font-bold text-brand shadow transition hover:bg-amber-400"
              >
                ลงทะเบียน
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
