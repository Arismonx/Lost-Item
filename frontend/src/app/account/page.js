export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">จัดการบัญชี</h1>
      <form className="mt-4 space-y-3">
        <input placeholder="ชื่อ-นามสกุล" className="w-full rounded border px-3 py-2" />
        <input type="password" placeholder="รหัสผ่านใหม่" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">บันทึก</button>
      </form>
    </main>
  );
}
