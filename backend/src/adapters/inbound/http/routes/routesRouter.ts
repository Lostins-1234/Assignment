import { Router, Request, Response } from 'express';
import { RouteServicePort } from '../../../core/ports/inbound/RouteServicePort';

export function createRoutesRouter(routeService: RouteServicePort): Router {
  const router = Router();

  router.get('/routes', async (req: Request, res: Response) => {
    try {
      const filters = {
        vesselType: req.query.vesselType as string | undefined,
        fuelType: req.query.fuelType as string | undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };

      const routes = await routeService.getAllRoutes(filters);
      res.json(routes);
    } catch (error) {
      console.error('Error in GET /routes:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/routes/comparison', async (req: Request, res: Response) => {
    try {
      const targetIntensity = req.query.targetIntensity
        ? parseFloat(req.query.targetIntensity as string)
        : undefined;

      const comparisons = await routeService.getComparison(targetIntensity);
      res.json(comparisons);
    } catch (error) {
      console.error('Error in GET /routes/comparison:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.post('/routes/:routeId/baseline', async (req: Request, res: Response) => {
    try {
      const { routeId } = req.params;
      const route = await routeService.setBaseline(routeId);
      res.json(route);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return router;
}


