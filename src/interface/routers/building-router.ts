import { Router } from "express";
import { BuildingController } from "../controllers/building-controller";
import { FloorController } from "../controllers/floor-controller";
import { UserRole } from "../../shared/enums/SystemRoles.enum";
import { authenticate, authorize } from "../middleware/auth-middleware";


const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER];
const SUPER_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const createBuildingRouter = (
  building: BuildingController,
  floor:    FloorController,
): Router => {
  const r = Router();
  r.use(authenticate);

  // ── Building routes ──────────────────────────────────────────────────────
  // GET  /buildings/stats/occupancy — must be before /:id
  r.get('/buildings/stats/occupancy',         building.getOccupancyStats);
  r.get('/buildings',                         building.getAll);
  r.get('/buildings/:id',                      building.getById);
  r.post('/buildings/create',   authorize(...ADMIN_ROLES), BuildingController.createValidation, building.create);
  r.put('/buildings/:id/update', authorize(...ADMIN_ROLES), building.update);
  r.delete('/buildings/:id/delete', authorize(...SUPER_ROLES), building.delete);

  // ── Floor routes (nested under building) ─────────────────────────────────
  r.get('/:buildingId/floors',    floor.getByBuilding);
  r.post('/:buildingId/floors',   authorize(...ADMIN_ROLES), floor.create);

  return r;
};

// Standalone floor routes (for direct floor operations by ID)
export const createFloorRouter = (floor: FloorController): Router => {
  const r = Router();
  r.use(authenticate);

  r.get('/:id',    floor.getById);
  r.put('/:id',    authorize(...[UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]), floor.update);
  r.delete('/:id', authorize(...[UserRole.ADMIN, UserRole.SUPER_ADMIN]), floor.delete);

  return r;
};
