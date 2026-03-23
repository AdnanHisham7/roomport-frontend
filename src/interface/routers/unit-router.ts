import { Router } from "express";
import { UnitController } from "../controllers/unit-controller";

export const createUnitRouter = (unitController: UnitController): Router => {
  const router = Router();

  router.post("/", (req, res, next) => unitController.createUnit(req, res, next));
  router.get("/", (req, res, next) => unitController.getAllUnits(req, res, next));
  router.get("/:id", (req, res, next) => unitController.getUnitById(req, res, next));
  router.patch("/:id", (req, res, next) => unitController.updateUnit(req, res, next));
  router.delete("/:id", (req, res, next) => unitController.deleteUnit(req, res, next));

  return router;
};
