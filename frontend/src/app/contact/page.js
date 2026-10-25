// ข้อมูลตัวอย่าง
const officers = [
  { name: 'เจ้าหน้าที่ A', phone: '02-000-0000', email: 'officer@ru.ac.th' },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ติดต่อเจ้าหน้าที่</h1>
      <ul className="mt-4 space-y-2">
        {officers.map((o) => (
          <li key={o.email} className="rounded border p-3">
            <div className="font-medium">{o.name}</div>
            <div className="text-sm">โทร {o.phone} · {o.email}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
