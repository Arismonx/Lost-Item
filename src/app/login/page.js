export default function LoginPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
      <form className="mt-4 space-y-3">
        <input type="email" placeholder="อีเมล RU Mail" className="w-full rounded border px-3 py-2" />
        <input type="password" placeholder="รหัสผ่าน" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">เข้าสู่ระบบ</button>
      </form>
    </main>
  );
}
