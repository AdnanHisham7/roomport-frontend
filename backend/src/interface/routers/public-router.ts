import { Router } from 'express';
import { PublicController } from '../controllers/public-controller';

export const createPublicRouter = (controller: PublicController): Router => {
  const router = Router();

  router.get('/buildings', controller.listBuildings);
  router.get('/buildings/featured', controller.getFeatured);
  router.get('/buildings/:id', controller.getBuildingDetail);
  router.get('/buildings/:id/units', controller.listUnits);
  router.get('/units/:id', controller.getUnitDetail);
  router.get('/filters', controller.getFilters);

  return router;
};
