import { Router, Request, Response } from 'express';
import { BankingServicePort } from '../../../core/ports/inbound/BankingServicePort';

export function createBankingRouter(bankingService: BankingServicePort): Router {
  const router = Router();

  router.get('/banking/records', async (req: Request, res: Response) => {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      if (!shipId || !year) {
        return res.status(400).json({ error: 'shipId and year are required' });
      }

      const records = await bankingService.getBankRecords(shipId, year);
      res.json(records);
    } catch (error) {
      console.error('Error in GET /banking/records:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.post('/banking/bank', async (req: Request, res: Response) => {
    try {
      const { shipId, year, amountGco2eq } = req.body;

      if (!shipId || !year || !amountGco2eq) {
        return res.status(400).json({ error: 'shipId, year, and amountGco2eq are required' });
      }

      const result = await bankingService.bankSurplus(shipId, year, amountGco2eq);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.post('/banking/apply', async (req: Request, res: Response) => {
    try {
      const { shipId, year, amountGco2eq } = req.body;

      if (!shipId || !year || !amountGco2eq) {
        return res.status(400).json({ error: 'shipId, year, and amountGco2eq are required' });
      }

      const result = await bankingService.applyBanked(shipId, year, amountGco2eq);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return router;
}


