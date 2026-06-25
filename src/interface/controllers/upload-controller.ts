import type { Request, Response } from 'express';
import crypto from 'crypto';
import { cloudinaryService } from '../../infrastructure/services/cloudinary.service';
import { BadRequestError } from '../../shared/error/app-error';

function uniqueName(original: string): string {
  const ext = original.match(/\.[^/.]+$/)?.at(0) ?? '.jpg';
  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
}

export class UploadController {
  uploadSingle = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.file) throw new BadRequestError('No file uploaded.', 'Attach a file under the "file" field.');
      const category = (req.params.category || 'misc').toString().replace(/[^a-z0-9_-]/gi, '');
      const result = await cloudinaryService.upload(req.file.buffer, category, uniqueName(req.file.originalname));
      return res.status(201).json({
        message: 'File uploaded.',
        data: { url: result.url, publicId: result.publicId, size: result.bytes, mimetype: req.file.mimetype },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ message: error.message || 'Upload failed.' });
    }
  };

  uploadMultiple = async (req: Request, res: Response): Promise<Response> => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) throw new BadRequestError('No files uploaded.', 'Attach one or more files under the "files" field.');
      const category = (req.params.category || 'misc').toString().replace(/[^a-z0-9_-]/gi, '');
      const uploads = await Promise.all(
        files.map((f) => cloudinaryService.upload(f.buffer, category, uniqueName(f.originalname)))
      );
      const data = uploads.map((r, i) => ({ url: r.url, publicId: r.publicId, size: r.bytes, mimetype: files[i].mimetype }));
      return res.status(201).json({ message: `${files.length} file(s) uploaded.`, data });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ message: error.message || 'Upload failed.' });
    }
  };
}
