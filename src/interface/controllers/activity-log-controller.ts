import { Request, Response } from 'express';
import { IActivityLogUsecase } from '../../application/usecase/activity-log/activity-log-usecase';

export class ActivityLogController {
  constructor(private activityLogUsecase: IActivityLogUsecase) {}

  async logActivity(req: Request, res: Response): Promise<void> {
    try {
      // In a real scenario, buildingId, userId might come from token / auth middleware too
      const data = {
        ...req.body,
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
      const filter = req.query;
      const activities = await this.activityLogUsecase.getActivities(filter);
      res.status(200).json({ success: true, data: activities });
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
      res.status(200).json({ success: true, data: activity });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActivitiesByBuilding(req: Request, res: Response): Promise<void> {
    try {
      const { buildingId } = req.params;
      const activities = await this.activityLogUsecase.getActivitiesByBuilding(buildingId as string);
      res.status(200).json({ success: true, data: activities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActivitiesByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const activities = await this.activityLogUsecase.getActivitiesByUser(userId as string);
      res.status(200).json({ success: true, data: activities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
