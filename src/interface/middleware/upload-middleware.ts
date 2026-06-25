import multer from 'multer';
import type { Request } from 'express';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Memory storage — files are streamed to Cloudinary, not saved to disk
const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed.'));
    return;
  }
  cb(null, true);
}

export const uploadImage = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
