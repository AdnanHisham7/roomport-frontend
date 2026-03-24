import type { NextFunction, Request, RequestHandler, Response } from "express";
import { IBuildingUseCases } from "../../application/interface/building/building-usecase.impl";
import type { CreateBuildingDTO, UpdateBuildingDTO } from "../../application/dtos/building/building.dto";
import type { BuildingStatus, BuildingType } from "../../domain/entities/Building";
import { AppError } from "../../shared/error/app-error";

export class BuildingController {
  constructor(private readonly uc: IBuildingUseCases) {}

  private static getSingleParam(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  }

  static createValidation: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { name, type, ownerId, totalUnits, totalFloors, location } = req.body;

    const errors: string[] = [];

    if (!name?.trim()) errors.push('name is required.');
    if (!type) {
      errors.push(
        'type is required (residential, commercial, mixed, industrial).'
      );
    }
    if (!ownerId?.trim()) errors.push('ownerId is required.');
    if (!totalUnits || isNaN(Number(totalUnits)) || Number(totalUnits) < 1) {
      errors.push('totalUnits must be >= 1.');
    }
    if (!totalFloors || isNaN(Number(totalFloors)) || Number(totalFloors) < 1) {
      errors.push('totalFloors must be >= 1.');
    }
    if (!location?.address?.trim()) errors.push('location.address is required.');
    if (!location?.city?.trim()) errors.push('location.city is required.');
    if (!location?.state?.trim()) errors.push('location.state is required.');
    if (!location?.pincode?.trim()) errors.push('location.pincode is required.');

    if (errors.length > 0) {
      res.status(422).json({
        message: 'Validation failed.',
        errors,
      });
      return;
    }

    next();
  };

  private handleError(
    res: Response,
    error: unknown,
    fallbackMessage: string
  ): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
        suggestion: error.suggestion,
      });
    }

    return res.status(500).json({
      message: fallbackMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  getOccupancyStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      const ownerId = req.query.ownerId as string;
      const data = await this.uc.getOccupancyStats(ownerId);

      return res.status(200).json({ data });
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch occupancy stats.');
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { ownerId, managerId, status, type } = req.query as {
        ownerId?: string;
        managerId?: string;
        status?: BuildingStatus;
        type?: BuildingType;
      };

      const data = await this.uc.getAll({
        ownerId,
        managerId,
        status,
        type,
      });

      return res.status(200).json({ data });
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch buildings.');
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const id = BuildingController.getSingleParam(req.params.id);
      const data = await this.uc.getById(id);

      return res.status(200).json({ data });
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch building.');
    }
  };

  create = async (req: Request<{}, {}, CreateBuildingDTO>, res: Response): Promise<Response> => {
    try {
      const payload: CreateBuildingDTO = {
        ...req.body,
        totalUnits: Number(req.body.totalUnits),
        totalFloors: Number(req.body.totalFloors),
      };

      const data = await this.uc.create(payload);

      return res.status(201).json({
        message: 'Building created successfully.',
        data,
      });
    } catch (error) {
      return this.handleError(res, error, 'Failed to create building.');
    }
  };

  update = async (req: Request<{ id: string }, {}, UpdateBuildingDTO>, res: Response): Promise<Response> => {
    try {
      const id = BuildingController.getSingleParam(req.params.id);
      const data = await this.uc.update(id, req.body);

      return res.status(200).json({
        message: 'Building updated successfully.',
        data,
      });
    } catch (error) {
      return this.handleError(res, error, 'Failed to update building.');
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const id = BuildingController.getSingleParam(req.params.id);
      await this.uc.delete(id);

      return res.status(200).json({
        message: 'Building deleted successfully.',
      });
    } catch (error) {
      return this.handleError(res, error, 'Failed to delete building.');
    }
  };
}
