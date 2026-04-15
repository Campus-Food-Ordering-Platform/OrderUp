import { Request, Response } from 'express';
import { authService } from '../auth/auth.service';

export const authController = {

  // POST /api/auth/signup
  async signup(req: Request, res: Response) {
    try {
      const { auth0Id, name, role } = req.body;

      if (!auth0Id || !name || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (!['customer', 'vendor', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const { user, isNew } = await authService.getOrCreateUser({
        auth0Id,
        name,
        role
      });

      return res.status(isNew ? 201 : 200).json({
        user,
        isNew,
        message: isNew ? 'User created successfully' : 'User already exists'
      });

    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Error during signup' });
    }
  },

  // GET /api/auth/me/:auth0Id
  async getMe(req: Request, res: Response) {
    try {
      const auth0Id = req.params['auth0Id'] as string;
      const user = await authService.findUserByAuth0Id(auth0Id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);

    } catch (error) {
      console.error('GetMe error:', error);
      return res.status(500).json({ message: 'Error fetching user' });
    }
  }
};