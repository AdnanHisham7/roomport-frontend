import type { Request, Response } from 'express';
import { IDocumentUseCases } from '../../application/interface/document/document-usecase-impl';
import { AppError, ForbiddenError } from '../../shared/error/app-error';
import { IBuildingRepository } from '../../domain/repository/building-repository-impl';

export class DocumentController {
  constructor(
    private readonly documentUseCases: IDocumentUseCases,
    private readonly buildingRepo: IBuildingRepository,
  ) {}

  private async assertBuildingOwnership(buildingId: string | undefined, userId: string, role: string): Promise<void> {
    if (role === 'super_admin' || !buildingId) return;
    const building = await this.buildingRepo.findById(buildingId);
    if (!building) throw new ForbiddenError('Building not found or access denied.', 'Provide a valid buildingId you own or manage.');
    if (building.ownerId !== userId && building.managerId !== userId) {
      throw new ForbiddenError('You do not have access to this building.', 'This building belongs to a different builder.');
    }
  }

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId, tenantId, unitId } = req.query as Record<string, string>;
      const user = req.user!;

      if (user.role !== 'super_admin') {
        if (buildingId) {
          await this.assertBuildingOwnership(buildingId, user.userId, user.role);
        } else {
          const owned = await this.buildingRepo.findAll({ ownerId: user.userId });
          const managed = await this.buildingRepo.findAll({ managerId: user.userId });
          const allBuildingIds = [...new Set([...owned, ...managed].map(b => b._id!))];
          if (!allBuildingIds.length) return res.status(200).json({ message: 'Documents fetched.', count: 0, data: [] });
          const results = await Promise.all(
            allBuildingIds.map(bid => this.documentUseCases.getAll({ buildingId: bid, tenantId, unitId }))
          );
          const all = results.flat();
          return res.status(200).json({ message: 'Documents fetched.', count: all.length, data: all });
        }
      }

      const docs = await this.documentUseCases.getAll({ buildingId, tenantId, unitId });
      return res.status(200).json({ message: 'Documents fetched.', count: docs.length, data: docs });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch documents.'); }
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const doc = await this.documentUseCases.getById(req.params.id);
      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(doc.buildingId, user.userId, user.role);
      }
      return res.status(200).json({ message: 'Document fetched.', data: doc });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch document.'); }
  };

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

      const user = req.user!;
      const buildingId = req.body.buildingId;
      if (user.role !== 'super_admin' && buildingId) {
        await this.assertBuildingOwnership(buildingId, user.userId, user.role);
      }

      const doc = await this.documentUseCases.create({ ...req.body });
      return res.status(201).json({ message: 'Document uploaded successfully.', data: doc });
    } catch (err) { return this.handleError(res, err, 'Failed to upload document.'); }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const doc = await this.documentUseCases.getById(req.params.id);
      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(doc.buildingId, user.userId, user.role);
      }
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
