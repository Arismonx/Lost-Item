// ข้อมูลตัวอย่าง
const users = [
  { id: 1, name: 'สมชาย', role: 'user' },
  { id: 2, name: 'สมหญิง', role: 'officer' },
];

export default function AdminUsersPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">จัดการผู้ใช้ / กำหนด Role</h1>
      <ul className="mt-4 space-y-2">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between rounded border p-3">
            <span>{u.name}</span>
            <select defaultValue={u.role} className="rounded border px-2 py-1">
              <option value="user">user</option>
              <option value="officer">officer</option>
            </select>
          </li>
        ))}
      </ul>
    </main>
  );
}
