import { Router } from "express";
import { UnitController } from "../controllers/unit-controller";
import { UserRole } from "../../shared/enums/SystemRoles.enum";
import { authenticate, authorize } from "../middleware/auth-middleware";

const MANAGE_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER];

export const createUnitRouter = (unitController: UnitController): Router => {
  const router = Router();
  router.use(authenticate);
  router.use(authorize(...MANAGE_ROLES));

  router.post("/", (req, res, next) => unitController.createUnit(req, res, next));
  router.get("/", (req, res, next) => unitController.getAllUnits(req, res, next));
  router.put("/bulk-update", (req, res, next) => unitController.bulkUpdateUnits(req, res, next));
  router.get("/:id", (req, res, next) => unitController.getUnitById(req, res, next));
  router.patch("/:id", (req, res, next) => unitController.updateUnit(req, res, next));
  router.delete("/:id", (req, res, next) => unitController.deleteUnit(req, res, next));

  return router;
};
