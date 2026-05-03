import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router();


router.get('/:vendor_id/revenue/export/csv', analyticsController.exportRevenueCSV);

export default router;