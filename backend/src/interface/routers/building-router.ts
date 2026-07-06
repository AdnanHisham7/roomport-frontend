import { Router } from "express";
import { BuildingController } from "../controllers/building-controller";
import { FloorController } from "../controllers/floor-controller";
import { UserRole } from "../../shared/enums/SystemRoles.enum";
import { authenticate, authorize } from "../middleware/auth-middleware";
import { validate } from "../middleware/validate-middleware";
import { createBuildingSchema } from "../validators/building.validator";
import { createFloorSchema, updateFloorSchema } from "../validators/domain.validator";

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER];
const SUPER_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const createBuildingRouter = (
  building: BuildingController,
  floor:    FloorController,
): Router => {
  const r = Router();
  r.use(authenticate);

  // ── Building routes ──────────────────────────────────────────────────────
  // GET  /stats/occupancy — must be before /:id
  r.get('/stats/occupancy',         building.getOccupancyStats);
  r.get('/',                         building.getAll);
  r.get('/:id',                      building.getById);
  r.post('/',   authorize(...ADMIN_ROLES), validate(createBuildingSchema), building.create);
  r.put('/:id/update', authorize(...ADMIN_ROLES), building.update);
  r.delete('/:id/delete', authorize(...SUPER_ROLES), building.delete);

  // ── Floor routes (nested under building) ─────────────────────────────────
  r.get('/:buildingId/floors',    floor.getByBuilding);
  r.post('/:buildingId/floors',   authorize(...ADMIN_ROLES), validate(createFloorSchema), floor.create);

  return r;
};

// Standalone floor routes (for direct floor operations by ID)
export const createFloorRouter = (floor: FloorController): Router => {
  const r = Router();
  r.use(authenticate);

  r.get('/:id',    floor.getById);
  r.put('/:id',    authorize(...[UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]), validate(updateFloorSchema), floor.update);
  r.delete('/:id', authorize(...[UserRole.ADMIN, UserRole.SUPER_ADMIN]), floor.delete);

  return r;
};
