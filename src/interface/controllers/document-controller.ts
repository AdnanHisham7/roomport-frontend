// ─── DOCUMENT CONTROLLER (midlaj) ─────────────────────────────────────────────
import type { Request, Response } from 'express';
import { IDocumentUseCases } from '../../application/interface/document/document-usecase-impl';
import { AppError } from '../../shared/error/app-error';


export class DocumentController {
  constructor(private readonly documentUseCases: IDocumentUseCases) {}
  // ── GET /documents ────────────────────────────────────────────────────────
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId, tenantId, unitId, type } = req.query as Record<string, string>;
      const docs = await this.documentUseCases.getAll({ buildingId, tenantId, unitId });
      return res.status(200).json({ message: 'Documents fetched.', count: docs.length, data: docs });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch documents.'); }
  };

  // ── GET /documents/:id ────────────────────────────────────────────────────
  getById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const doc = await this.documentUseCases.getById(req.params.id);
      return res.status(200).json({ message: 'Document fetched.', data: doc });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch document.'); }
  };

  // ── POST /documents ───────────────────────────────────────────────────────
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { type, title, fileUrl, uploadedBy } = req.body;
      if (!type || !title?.trim() || !fileUrl?.trim() || !uploadedBy?.trim()) {
        return res.status(422).json({
          message:    'Validation failed.',
          suggestion: 'Provide type, title, fileUrl, and uploadedBy.',
          errors:     [
            !type          && 'type is required.',
            !title?.trim() && 'title is required.',
            !fileUrl?.trim() && 'fileUrl is required.',
            !uploadedBy?.trim() && 'uploadedBy is required.',
          ].filter(Boolean),
        });
      }
      const doc = await this.documentUseCases.create({ ...req.body });
      return res.status(201).json({ message: 'Document uploaded successfully.', data: doc });
    } catch (err) { return this.handleError(res, err, 'Failed to upload document.'); }
  };

  // ── DELETE /documents/:id ─────────────────────────────────────────────────
  delete = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      await this.documentUseCases.delete(req.params.id);
      return res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (err) { return this.handleError(res, err, 'Failed to delete document.'); }
  };

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message, suggestion: error.suggestion });
    }
    return res.status(500).json({ message: fallback, suggestion: 'Please try again later.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
