export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ค้นหาของหาย</h1>
      <form className="mt-4 flex gap-2">
        <input placeholder="ชื่อของ หรือ สถานที่" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ค้นหา</button>
      </form>
      <p className="mt-4 text-gray-500">ยังไม่มีผลลัพธ์</p>
    </main>
  );
}
