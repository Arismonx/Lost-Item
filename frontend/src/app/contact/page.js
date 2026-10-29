'use client';
import { useEffect, useState } from 'react';
import { getJson } from '../../lib/api';

// แก้ข้อความสถานที่/เวลารับของตรงนี้ให้ตรงกับของจริง
const PICKUP_PLACE = 'ภาควิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยรามคำแหง';
const PICKUP_TIME = 'ติดต่อเจ้าหน้าที่เพื่อนัดเวลา';

export default function ContactPage() {
  const [officers, setOfficers] = useState(null);
  const [itemName, setItemName] = useState(''); // ชื่อของจาก ?item= (มาจากปุ่มในหน้าค้นหา)

  useEffect(() => {
    getJson('/api/contact/officers').then(({ ok, data }) => {
      setItemName(new URLSearchParams(window.location.search).get('item') || '');
      setOfficers(ok ? data.officers : []);
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ติดต่อเจ้าหน้าที่</h1>

      {itemName && (
        <section className="mt-4 rounded border border-blue-300 bg-blue-50 p-3">
          <div>คุณกำลังติดต่อเรื่อง: <span className="font-semibold">{itemName}</span></div>
          <p className="text-sm text-gray-600">กรุณาแจ้งชื่อของนี้กับเจ้าหน้าที่ และพกบัตรประจำตัวมาด้วย</p>
        </section>
      )}

      <section className="mt-4 rounded border p-3">
        <div className="font-medium">รับของหาย</div>
        <p className="mt-1 text-sm">สถานที่: {PICKUP_PLACE}</p>
        <p className="text-sm">เวลา: {PICKUP_TIME}</p>
        <p className="mt-1 text-sm text-gray-500">โปรดนำบัตรประจำตัวมาเพื่อยืนยันความเป็นเจ้าของ</p>
      </section>

      <h2 className="mt-6 text-lg font-semibold">รายชื่อเจ้าหน้าที่</h2>
      <ul className="mt-2 space-y-2">
        {officers?.map((o) => (
          <li key={o.id} className="rounded border p-3">
            <div className="font-medium">{o.name}</div>
            <div className="text-sm">โทร {o.contact || '-'} · {o.email}</div>
          </li>
        ))}
        {officers && officers.length === 0 && <li className="text-gray-500">ยังไม่มีรายชื่อเจ้าหน้าที่</li>}
      </ul>
    </main>
  );
}
