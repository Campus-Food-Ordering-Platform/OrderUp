import { Router } from 'express';
import { authController } from '../auth/auth.controller';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authController.signup);

// GET /api/auth/me/:azureId
router.get('/me/:azureId', authController.getMe);

export default router;