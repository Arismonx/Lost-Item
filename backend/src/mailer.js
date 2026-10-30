import nodemailer from 'nodemailer'

// ส่งอีเมล ถ้าไม่ได้ตั้ง SMTP_HOST ใน .env (ตอนพัฒนา) จะพิมพ์ข้อความลงคอนโซลของ backend แทน
export async function sendMail({ to, subject, text }) {
  if (!process.env.SMTP_HOST) {
    console.log(`[mail:dev] to=${to}\nsubject=${subject}\n${text}`)
    return
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true = พอร์ต 465
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text })
}
