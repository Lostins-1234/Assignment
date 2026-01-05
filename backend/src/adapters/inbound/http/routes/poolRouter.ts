import { Router, Request, Response } from 'express';
import { PoolServicePort } from '../../../core/ports/inbound/PoolServicePort';

export function createPoolRouter(poolService: PoolServicePort): Router {
  const router = Router();

  router.post('/pools', async (req: Request, res: Response) => {
    try {
      const { year, memberShipIds } = req.body;

      if (!year || !memberShipIds || !Array.isArray(memberShipIds)) {
        return res.status(400).json({ error: 'year and memberShipIds (array) are required' });
      }

      const result = await poolService.createPool({ year, memberShipIds });
      res.json(result);
    } catch (error) {
      console.error('Error in POST /pools:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return router;
}


