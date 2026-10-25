// ข้อมูลตัวอย่าง – ภายหลังเปลี่ยนเป็นดึงจากฐานข้อมูล
const posts = [
  { id: 1, title: 'พบกระเป๋าสตางค์สีดำ', date: '2026-10-20' },
  { id: 2, title: 'พบกุญแจรถ หน้าตึกวิทยาศาสตร์', date: '2026-10-22' },
];

export default function BroadcastPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ประชาสัมพันธ์</h1>
      <ul className="mt-4 space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="rounded border p-3">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-500">{p.date}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
