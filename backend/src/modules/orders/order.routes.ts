import { Router } from 'express';
import {
  createOrderHandler,
  getVendorOrdersHandler,
  getOrderStatusHandler,
  advanceOrderStatusHandler,
  getStudentActiveOrderHandler,
  getStudentHistoryHandler,
  getAllOrdersAdminHandler
} from './order.controller';

const router = Router();

router.post('/', createOrderHandler);
router.get('/vendor/:vendorId', getVendorOrdersHandler);
router.get('/admin/all', getAllOrdersAdminHandler);
router.get('/student/:studentId/active', getStudentActiveOrderHandler); 
router.get('/:orderId/status', getOrderStatusHandler);
router.patch('/:orderId/status', advanceOrderStatusHandler);
router.get('/student-history/:studentId', getStudentHistoryHandler);

export default router;