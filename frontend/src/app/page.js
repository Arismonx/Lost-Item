import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">ของหายแล้วได้คืน</h1>
      <p className="mt-2 text-gray-500">
        ระบบแจ้งและค้นหาของหาย สำหรับภาควิชาวิทยาการคอมพิวเตอร์
      </p>

      <div className="mt-6 flex gap-3">
        <Link href="/search" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          ค้นหาของหาย
        </Link>
        <Link href="/broadcast" className="rounded border px-4 py-2">
          ดูประชาสัมพันธ์
        </Link>
      </div>
    </main>
  );
}
