import Link from 'next/link';

// ข้อมูลตัวอย่าง
const items = [
  { id: 1, name: 'กระเป๋าสตางค์สีดำ', place: 'โรงอาหาร', status: 'รอรับคืน' },
  { id: 2, name: 'กุญแจรถ', place: 'ตึกวิทยาศาสตร์', status: 'คืนแล้ว' },
];

export default function LostItemsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการของหาย</h1>
        <Link href="/lost-items/new" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+ เพิ่ม</Link>
      </div>
      <table className="mt-4 w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">ชื่อ</th>
            <th>สถานที่</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-b">
              <td className="py-2">{i.name}</td>
              <td>{i.place}</td>
              <td>{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
