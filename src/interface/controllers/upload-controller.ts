import type { Request, Response } from "express";
import { buildFileUrl } from "../middleware/upload-middleware";
import { BadRequestError } from "../../shared/error/app-error";

export class UploadController {
  uploadSingle = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.file) throw new BadRequestError('No file uploaded.', 'Attach a file under the "file" field.');
      const category = (req.params.category || 'misc').toString();
      const url = buildFileUrl(req, category, req.file.filename);
      return res.status(201).json({ message: 'File uploaded.', data: { url, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype } });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ message: error.message || 'Upload failed.' });
    }
  };

  uploadMultiple = async (req: Request, res: Response): Promise<Response> => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) throw new BadRequestError('No files uploaded.', 'Attach one or more files under the "files" field.');
      const category = (req.params.category || 'misc').toString();
      const data = files.map(f => ({ url: buildFileUrl(req, category, f.filename), filename: f.filename, size: f.size, mimetype: f.mimetype }));
      return res.status(201).json({ message: `${files.length} file(s) uploaded.`, data });
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ message: error.message || 'Upload failed.' });
    }
  };
}
