'use client';
import useRequireRole from '../../lib/useRequireRole';
import { Fragment, useEffect, useState } from 'react';
import { getJson, postJson, sendForm, checkImage, evidenceImageUrl } from '../../lib/api';

const inputClass = 'w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-accent';

// ช่องเลือกรูปหลักฐาน (ไม่บังคับ)
function ImageField({ label }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-700">{label} (ไม่บังคับ, JPG/PNG/WebP ไม่เกิน 5 MB)</label>
      <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold hover:file:bg-slate-200" />
    </div>
  );
}

// รูปหลักฐานในรายละเอียด (กดเพื่อดูภาพเต็มในแท็บใหม่)
function Evidence({ name, label }) {
  if (!name) return null;
  return (
    <a href={evidenceImageUrl(name)} target="_blank" rel="noreferrer" className="block">
      <span className="font-semibold">{label}:</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={evidenceImageUrl(name)} alt={label} className="mt-1 max-h-40 rounded-xl border border-slate-200" />
    </a>
  );
}

export default function ReturnsPage() {
  const allowed = useRequireRole(['officer', 'admin']);
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
    const imageError = checkImage(form.get('image'));
    if (imageError) return setError(imageError);
    const { ok, data } = await sendForm('POST', '/api/returns', form);
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
    const imageError = checkImage(form.get('image'));
    if (imageError) return setError(imageError);
    const { ok, data } = await sendForm('POST', `/api/returns/${returnId}/dispute`, form);
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

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-brand">ยืนยันการส่งมอบของหาย</h1>
        <p className="text-xs text-slate-500">บันทึกผู้รับคืน ผู้ส่งมอบ พยาน และรูปหลักฐาน</p>
      </div>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{message}</p>}

      {items && (
        <form onSubmit={handleReturn} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <ImageField label="รูปหลักฐานการส่งมอบ" />
          <button type="submit" className="cursor-pointer rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#001c30]">ยืนยันส่งมอบ</button>
        </form>
      )}

      {returns.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-brand">ประวัติการส่งมอบ</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">ของ</th>
                <th>ผู้รับ</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-semibold text-brand">{r.item_name}</td>
                    <td>{r.receiver_name}</td>
                    <td>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${r.item_status === 'disputed' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {r.item_status === 'disputed' ? 'มีข้อโต้แย้ง' : 'คืนแล้ว'}
                      </span>
                    </td>
                    <td className="space-x-3 pr-4 text-xs">
                      <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="cursor-pointer font-semibold text-brand underline">
                        {openId === r.id ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                      </button>
                      {r.item_status === 'returned' && !r.claimant_name && (
                        <button onClick={() => setDisputeId(disputeId === r.id ? null : r.id)} className="cursor-pointer font-semibold text-rose-600 underline">
                          แจ้งข้อโต้แย้ง
                        </button>
                      )}
                      {r.item_status === 'disputed' && (
                        <button onClick={() => setResolveId(resolveId === r.id ? null : r.id)} className="cursor-pointer font-semibold text-emerald-700 underline">
                          ปิดข้อโต้แย้ง
                        </button>
                      )}
                    </td>
                  </tr>
                  {openId === r.id && (
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <td colSpan={4} className="space-y-1 p-4 text-xs text-slate-700">
                        <p>ผู้รับคืน: {r.receiver_name} (ติดต่อ: {r.receiver_contact || '-'})</p>
                        <p>ผู้ส่งมอบ: {r.sender_name || '-'}</p>
                        <p>พยาน: {r.witness_name || '-'}</p>
                        <p>เจ้าหน้าที่ที่บันทึก: {r.officer_name}</p>
                        <p>วันเวลาที่ส่งมอบ: {new Date(r.returned_at).toLocaleString('th-TH')}</p>
                        <Evidence name={r.proof_image} label="รูปหลักฐานการส่งมอบ" />
                        {r.claimant_name && (
                          <p className="text-rose-600">
                            ข้อโต้แย้ง: {r.claimant_name} - {r.dispute_detail} ({new Date(r.disputed_at).toLocaleString('th-TH')})
                          </p>
                        )}
                        <Evidence name={r.dispute_image} label="รูปหลักฐานของผู้โต้แย้ง" />
                        {r.resolved_at && (
                          <p className="text-emerald-700">
                            ผลการเจรจา: {r.resolution} ({new Date(r.resolved_at).toLocaleString('th-TH')})
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                  {resolveId === r.id && (
                    <tr className="border-t border-slate-100">
                      <td colSpan={4} className="p-4">
                        <form onSubmit={(e) => handleResolve(e, r.id)} className="space-y-2">
                          <p className="text-xs text-rose-600">
                            ข้อโต้แย้ง: {r.claimant_name} - {r.dispute_detail}
                          </p>
                          <textarea name="resolution" required placeholder="ผลการเจรจา เช่น ผู้รับเดิมเป็นเจ้าของจริง" className={inputClass} />
                          <button type="submit" className="cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">บันทึกและปิดข้อโต้แย้ง</button>
                        </form>
                      </td>
                    </tr>
                  )}
                  {disputeId === r.id && (
                    <tr className="border-t border-slate-100">
                      <td colSpan={4} className="p-4">
                        <form onSubmit={(e) => handleDispute(e, r.id)} className="space-y-2">
                          <input name="claimant_name" required placeholder="ชื่อผู้โต้แย้ง" className={inputClass} />
                          <textarea name="new_detail" required placeholder="รายละเอียดที่อ้างเป็นเจ้าของ" className={inputClass} />
                          <ImageField label="รูปหลักฐานของผู้โต้แย้ง" />
                          <button type="submit" className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700">บันทึกข้อโต้แย้ง</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </main>
  );
}
