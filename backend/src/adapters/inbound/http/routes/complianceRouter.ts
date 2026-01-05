import { Router, Request, Response } from 'express';
import { ComplianceServicePort } from '../../../core/ports/inbound/ComplianceServicePort';

export function createComplianceRouter(complianceService: ComplianceServicePort): Router {
  const router = Router();

  router.get('/compliance/cb', async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      if (!shipId || !year) {
        return res.status(400).json({ error: 'shipId and year are required' });
      }

      const cb = await complianceService.getComplianceBalance(shipId, year);
      if (!cb) {
        return res.status(404).json({ error: 'Compliance balance not found' });
      }

      res.json(cb);
    } catch (error) {
      console.error('Error in GET /compliance/cb:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/compliance/adjusted-cb', async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      if (!shipId || !year) {
        return res.status(400).json({ error: 'shipId and year are required' });
      }

      const adjustedCb = await complianceService.getAdjustedComplianceBalance(shipId, year);
      if (!adjustedCb) {
        return res.status(404).json({ error: 'Adjusted compliance balance not found' });
      }

      res.json(adjustedCb);
    } catch (error) {
      console.error('Error in GET /compliance/adjusted-cb:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.post('/compliance/calculate', async (req: Request, res: Response) => {
    try {
      const { shipId, routeId, year } = req.body;

      if (!shipId || !routeId || !year) {
        return res.status(400).json({ error: 'shipId, routeId, and year are required' });
      }

      const cb = await complianceService.calculateAndStoreComplianceBalance(shipId, routeId, year);
      res.json(cb);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return router;
}
