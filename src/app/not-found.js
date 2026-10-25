import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">404 - ไม่พบหน้านี้</h1>
      <p className="mt-2">ไม่พบหน้าที่คุณต้องการ</p>
      <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">กลับหน้าแรก</Link>
    </div>
  )
}
