import type { NextFunction, Request, RequestHandler, Response } from "express";
import { IBuildingUseCases } from "../../application/interface/building/building-usecase.impl";
import type { CreateBuildingDTO, UpdateBuildingDTO } from "../../application/dtos/building/building.dto";
import type { BuildingStatus, BuildingType } from "../../domain/entities/Building";
import { AppError } from "../../shared/error/app-error";

export class BuildingController {
  constructor(private readonly uc: IBuildingUseCases) { }

  private static getSingleParam(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  }

  static createValidation: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { name,
      type,
      ownerId,
      totalUnits,
      floors,
      location,
      amenities,
      images,
      documents,
      description,
      yearOfBuild,
      sqft,
      lift,
      helipad,
      nearAirport,
      nearRailwayStation,
      nearBusStand,
      nearPark,
      numberOfUnitsInFloor
    } = req.body;

    const errors: string[] = [];
    console.log(req.body)
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
    if (!Object.keys(floors).length || isNaN(Number(Object.keys(floors).length)) || Number(Object.keys(floors).length) < 1) {
      errors.push('floors must be >= 1.');
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
        totalFloors: Number(Object.keys(req.body.floors).length),
      };
      console.log(payload) 

      const data = await this.uc.create(payload);
      
      console.log(data)

      let floorData: any[] = [];
      if (Array.isArray(req.body.floors)) {
        floorData = req.body.floors.map((floorItem: any, index: number) => {
          if (typeof floorItem === 'object' && floorItem !== null) {
            return {
              buildingId: data._id,
              floorNumber: Number(floorItem.floorNumber ?? index),
              name: floorItem.name || `Floor ${floorItem.floorNumber ?? index}`,
              totalUnits: Number(floorItem.totalUnits || floorItem.units || floorItem.numberOfUnits || 0),
            };
          } else {
            return {
              buildingId: data._id,
              floorNumber: index,
              name: `Floor ${index}`,
              totalUnits: Number(floorItem),
            };
          }
        });
      } else {
        floorData = Object.entries(req.body.floors).map(([key, units], index) => {
          // If key is something like "Ground" or "Floor 1", parseInt will return NaN
          const parsedKey = parseInt(key, 10);
          const floorNum = isNaN(parsedKey) ? index : parsedKey;
          return {
            buildingId: data._id,
            floorNumber: floorNum,
            name: isNaN(parsedKey) ? key : `Floor ${floorNum}`,
            totalUnits: Number(units),
          };
        });
      }

      await this.uc.createFloors(floorData);

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
