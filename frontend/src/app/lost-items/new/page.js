export default function NewLostItemPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ลงทะเบียนของหาย</h1>
      <form className="mt-4 space-y-3">
        <input placeholder="ชื่อของ" className="w-full rounded border px-3 py-2" />
        <input type="date" className="w-full rounded border px-3 py-2" />
        <input placeholder="สถานที่พบ" className="w-full rounded border px-3 py-2" />
        <textarea placeholder="รายละเอียดเพิ่มเติม" className="w-full rounded border px-3 py-2" />
        <input type="file" accept="image/*" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">บันทึก</button>
      </form>
    </main>
  );
}
