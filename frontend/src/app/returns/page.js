'use client';
import { Fragment, useEffect, useState } from 'react';
import { getJson, postJson } from '../../lib/api';

const inputClass = 'w-full rounded border px-3 py-2';

export default function ReturnsPage() {
  const [items, setItems] = useState(null); // ของที่รอรับคืน (null = กำลังโหลด)
  const [returns, setReturns] = useState([]); // ประวัติการส่งมอบ
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [disputeId, setDisputeId] = useState(null); // แถวที่กำลังกรอกข้อโต้แย้ง
  const [openId, setOpenId] = useState(null); // แถวที่กางดูรายละเอียด
  const [resolveId, setResolveId] = useState(null); // แถวที่กำลังกรอกผลการเจรจา

  async function load() {
    try {
      const [a, b] = await Promise.all([getJson('/api/lost-items'), getJson('/api/returns')]);
      if (!a.ok) return setError(a.data.error || 'โหลดข้อมูลไม่สำเร็จ');
      if (!b.ok) return setError(b.data.error || 'โหลดข้อมูลไม่สำเร็จ');
      setItems(a.data.items.filter((i) => i.status === 'found'));
      setReturns(b.data.returns);
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleReturn(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    const form = new FormData(e.target);
    const { ok, data } = await postJson('/api/returns', Object.fromEntries(form));
    if (!ok) return setError(data.error || 'บันทึกไม่สำเร็จ');
    e.target.reset();
    setMessage('บันทึกการส่งมอบแล้ว');
    load();
  }

  async function handleDispute(e, returnId) {
    e.preventDefault();
    setError('');
    setMessage('');
    const form = new FormData(e.target);
    const { ok, data } = await postJson(`/api/returns/${returnId}/dispute`, Object.fromEntries(form));
    if (!ok) return setError(data.error || 'บันทึกไม่สำเร็จ');
    setDisputeId(null);
    setMessage('บันทึกข้อโต้แย้งแล้ว');
    load();
  }

  async function handleResolve(e, returnId) {
    e.preventDefault();
    setError('');
    setMessage('');
    const form = new FormData(e.target);
    const { ok, data } = await postJson(`/api/returns/${returnId}/resolve`, Object.fromEntries(form));
    if (!ok) return setError(data.error || 'บันทึกไม่สำเร็จ');
    setResolveId(null);
    setMessage('ปิดข้อโต้แย้งแล้ว');
    load();
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">ยืนยันการส่งมอบของหาย</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}

      {items && (
        <form onSubmit={handleReturn} className="mt-4 space-y-3">
          <select name="item_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              {items.length === 0 ? 'ไม่มีของที่รอรับคืน' : 'เลือกของหายที่จะส่งมอบ'}
            </option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                #{i.id} {i.name} ({i.location})
              </option>
            ))}
          </select>
          <input name="receiver_name" required placeholder="ชื่อผู้รับคืน" className={inputClass} />
          <input name="receiver_contact" placeholder="เบอร์ติดต่อผู้รับ" className={inputClass} />
          <input name="sender_name" placeholder="ชื่อผู้ส่งมอบ (เจ้าหน้าที่)" className={inputClass} />
          <input name="witness_name" placeholder="ชื่อพยาน" className={inputClass} />
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">ยืนยันส่งมอบ</button>
        </form>
      )}

      {returns.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-bold">ประวัติการส่งมอบ</h2>
          <table className="mt-2 w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">ของ</th>
                <th>ผู้รับ</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b align-top">
                    <td className="py-2">{r.item_name}</td>
                    <td>{r.receiver_name}</td>
                    <td>{r.item_status === 'disputed' ? 'มีข้อโต้แย้ง' : 'คืนแล้ว'}</td>
                    <td className="space-x-3">
                      <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="text-blue-600 underline">
                        {openId === r.id ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                      </button>
                      {r.item_status === 'returned' && !r.claimant_name && (
                        <button onClick={() => setDisputeId(disputeId === r.id ? null : r.id)} className="text-red-600 underline">
                          แจ้งข้อโต้แย้ง
                        </button>
                      )}
                      {r.item_status === 'disputed' && (
                        <button onClick={() => setResolveId(resolveId === r.id ? null : r.id)} className="text-green-700 underline">
                          ปิดข้อโต้แย้ง
                        </button>
                      )}
                    </td>
                  </tr>
                  {openId === r.id && (
                    <tr className="border-b bg-gray-50">
                      <td colSpan={4} className="space-y-1 p-3 text-sm">
                        <p>ผู้รับคืน: {r.receiver_name} (ติดต่อ: {r.receiver_contact || '-'})</p>
                        <p>ผู้ส่งมอบ: {r.sender_name || '-'}</p>
                        <p>พยาน: {r.witness_name || '-'}</p>
                        <p>เจ้าหน้าที่ที่บันทึก: {r.officer_name}</p>
                        <p>วันเวลาที่ส่งมอบ: {new Date(r.returned_at).toLocaleString('th-TH')}</p>
                        {r.claimant_name && (
                          <p className="text-red-600">
                            ข้อโต้แย้ง: {r.claimant_name} - {r.dispute_detail} ({new Date(r.disputed_at).toLocaleString('th-TH')})
                          </p>
                        )}
                        {r.resolved_at && (
                          <p className="text-green-700">
                            ผลการเจรจา: {r.resolution} ({new Date(r.resolved_at).toLocaleString('th-TH')})
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                  {resolveId === r.id && (
                    <tr className="border-b">
                      <td colSpan={4} className="p-3">
                        <form onSubmit={(e) => handleResolve(e, r.id)} className="space-y-2">
                          <p className="text-sm text-red-600">
                            ข้อโต้แย้ง: {r.claimant_name} - {r.dispute_detail}
                          </p>
                          <textarea name="resolution" required placeholder="ผลการเจรจา เช่น ผู้รับเดิมเป็นเจ้าของจริง" className={inputClass} />
                          <button type="submit" className="rounded bg-green-700 px-3 py-1 text-white hover:bg-green-800">บันทึกและปิดข้อโต้แย้ง</button>
                        </form>
                      </td>
                    </tr>
                  )}
                  {disputeId === r.id && (
                    <tr className="border-b">
                      <td colSpan={4} className="p-3">
                        <form onSubmit={(e) => handleDispute(e, r.id)} className="space-y-2">
                          <input name="claimant_name" required placeholder="ชื่อผู้โต้แย้ง" className={inputClass} />
                          <textarea name="new_detail" required placeholder="รายละเอียดที่อ้างเป็นเจ้าของ" className={inputClass} />
                          <button type="submit" className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">บันทึกข้อโต้แย้ง</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
