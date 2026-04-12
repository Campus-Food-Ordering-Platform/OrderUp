import { Router } from 'express';
import { authController } from '../auth/auth.controller';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authController.signup);

// GET /api/auth/me/:auth0Id
router.get('/me/:auth0Id', authController.getMe);

export default router;