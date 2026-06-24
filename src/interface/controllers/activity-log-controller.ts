import { Request, Response } from 'express';
import { IActivityLogUsecase } from '../../application/usecase/activity-log/activity-log-usecase';
import { IBuildingRepository } from '../../domain/repository/building-repository-impl';

export class ActivityLogController {
  constructor(
    private activityLogUsecase: IActivityLogUsecase,
    private buildingRepo: IBuildingRepository
  ) {}

  /** For non-super-admins, restricts a building-scoped query to a building they actually own/manage. */
  private async assertBuildingScope(req: Request, buildingId?: string): Promise<boolean> {
    const user = req.user!;
    if (user.role === 'super_admin') return true;
    if (!buildingId) return false;
    const building = await this.buildingRepo.findById(buildingId);
    if (!building) return false;
    return building.ownerId === user.userId || building.managerId === user.userId;
  }

  async logActivity(req: Request, res: Response): Promise<void> {
    try {
      const data = {
        ...req.body,
        userId: req.user!.userId,    // never trust a client-supplied actor id
        ipAddress: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent']
      };

      const activityLog = await this.activityLogUsecase.logActivity(data);
      res.status(201).json({ success: true, data: activityLog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActivities(req: Request, res: Response): Promise<void> {
    try {
      const { buildingId, page, limit, ...rest } = req.query as Record<string, string>;

      if (req.user!.role !== 'super_admin') {
        const allowed = await this.assertBuildingScope(req, buildingId);
        if (!allowed) {
          res.status(403).json({ success: false, message: 'Specify a buildingId you own or manage to view its activity.' });
          return;
        }
      }

      const filter = { ...rest, ...(buildingId ? { buildingId } : {}) };
      const result = await this.activityLogUsecase.getActivitiesPaginated(
        filter as any,
        Number(page) || 1,
        Math.min(Number(limit) || 20, 100)
      );
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActivityById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const activity = await this.activityLogUsecase.getActivityById(id as string);
      if (!activity) {
        res.status(404).json({ success: false, message: 'Activity log not found' });
        return;
      }
      if (req.user!.role !== 'super_admin') {
        const allowed = await this.assertBuildingScope(req, activity.buildingId);
        if (!allowed) {
          res.status(403).json({ success: false, message: 'You do not have access to this activity log.' });
          return;
        }
      }
      res.status(200).json({ success: true, data: activity });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActivitiesByBuilding(req: Request, res: Response): Promise<void> {
    try {
      const buildingId = req.params.buildingId as string;
      const allowed = await this.assertBuildingScope(req, buildingId);
      if (!allowed) {
        res.status(403).json({ success: false, message: 'You do not have access to this building.' });
        return;
      }
      const activities = await this.activityLogUsecase.getActivitiesByBuilding(buildingId as string);
      res.status(200).json({ success: true, data: activities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActivitiesByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (req.user!.role !== 'super_admin' && req.user!.userId !== userId) {
        res.status(403).json({ success: false, message: 'You can only view your own activity.' });
        return;
      }
      const activities = await this.activityLogUsecase.getActivitiesByUser(userId as string);
      res.status(200).json({ success: true, data: activities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
