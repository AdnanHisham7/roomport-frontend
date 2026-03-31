import { Request, Response, NextFunction } from "express";
import { IUnitUseCases } from "../../application/interface/unit/unit-usecase-impl";

export class UnitController {
  constructor(private readonly unitUseCases: IUnitUseCases) {}

  async createUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await this.unitUseCases.create(req.body);
      res.status(201).json({ success: true, data: unit });
    } catch (error) {
      next(error);
    }
  }

  async getAllUnits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { buildingId, status, isOccupied } = req.query;
      const filter: any = {};
      if (buildingId) filter.buildingId = buildingId as string;
      if (status) filter.status = status as string;
      if (isOccupied !== undefined) filter.isOccupied = isOccupied === 'true';

      const units = await this.unitUseCases.getAll(filter);
      res.status(200).json({ success: true, data: units });
    } catch (error) {
      next(error);
    }
  }

  async getUnitById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await this.unitUseCases.getById(req.params.id as string);
      res.status(200).json({ success: true, data: unit });
    } catch (error) {
      next(error);
    }
  }

  async updateUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await this.unitUseCases.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: unit });
    } catch (error) {
      next(error);
    }
  }

  async deleteUnit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.unitUseCases.delete(req.params.id as string);
      res.status(200).json({ success: true, message: "Unit deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
