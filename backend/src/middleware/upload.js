import multer from 'multer'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// โฟลเดอร์เก็บรูป: items = รูปของหาย (สาธารณะ)
export const UPLOAD_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

// รับรูป 1 ไฟล์จากช่องชื่อ "image" เก็บลง uploads/<folder> ด้วยชื่อสุ่ม (ไม่ใช้ชื่อไฟล์ของผู้ใช้)
// ใช้เป็น middleware ก่อน handler: ไฟล์จะอยู่ที่ req.file (ถ้ามี) และ req.file.filename คือชื่อที่เก็บลง DB
export function uploadImage(folder) {
  const upload = multer({
    storage: multer.diskStorage({
      destination: path.join(UPLOAD_ROOT, folder),
      filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXT[file.mimetype]),
    }),
    limits: { fileSize: MAX_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
      if (!EXT[file.mimetype]) return cb(new Error('INVALID_TYPE'))
      cb(null, true)
    },
  }).single('image')

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (!err) return next()
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'รูปต้องมีขนาดไม่เกิน 5 MB' })
      if (err.message === 'INVALID_TYPE') return res.status(400).json({ error: 'รองรับเฉพาะไฟล์ JPG, PNG, WebP' })
      next(err)
    })
  }
}
