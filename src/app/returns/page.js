export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ยืนยันการส่งมอบของหาย</h1>
      <form className="mt-4 space-y-3">
        <input placeholder="รหัสของหาย" className="w-full rounded border px-3 py-2" />
        <input placeholder="ชื่อผู้รับคืน" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ยืนยันส่งมอบ</button>
      </form>
    </main>
  );
}
