import { Router } from 'express';
import {
  createOrderHandler,
  getVendorOrdersHandler,
  getOrderStatusHandler,
  advanceOrderStatusHandler,
  getStudentActiveOrderHandler,
} from './order.controller';

const router = Router();

router.post('/', createOrderHandler);
router.get('/vendor/:vendorId', getVendorOrdersHandler);
router.get('/student/:studentId/active', getStudentActiveOrderHandler); 
router.get('/:orderId/status', getOrderStatusHandler);
router.patch('/:orderId/status', advanceOrderStatusHandler);

export default router;