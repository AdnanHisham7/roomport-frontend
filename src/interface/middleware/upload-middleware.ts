import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import type { Request } from 'express';

const UPLOAD_ROOT = path.join(__dirname, '..', '..', '..', 'uploads');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const category = (req.params.category || req.query.category || 'misc').toString().replace(/[^a-z0-9_-]/gi, '');
    const dir = path.join(UPLOAD_ROOT, category);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed.'));
    return;
  }
  cb(null, true);
}

export const uploadImage = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

/** Builds a publicly-fetchable URL for an uploaded file, served via express.static('/uploads'). */
export function buildFileUrl(req: Request, category: string, filename: string): string {
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${category}/${filename}`;
}

export { UPLOAD_ROOT };
