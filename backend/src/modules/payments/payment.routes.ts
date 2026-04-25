import { Router } from 'express';
import { paymentController } from './payment.controller';

const router = Router();

router.post('/initialize', paymentController.initializePayment);
router.get('/verify/:reference', paymentController.verifyPayment);

export default router;