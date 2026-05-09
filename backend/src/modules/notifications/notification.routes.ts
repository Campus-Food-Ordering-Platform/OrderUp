import { Router } from 'express';
import { savePushSubscription } from './notification.controller';

const router = Router();

router.post('/subscribe', savePushSubscription);

export default router;