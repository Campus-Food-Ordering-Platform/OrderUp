import { Request, Response } from 'express';
import { userService } from '../users/user.service';

export const userController = {

  // GET /api/users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // GET /api/users/:id
  async getUserById(req: Request, res: Response) {
    try {
        const id = req.params['id'] as string;
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user' });
    }
  },

  // POST /api/users
  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error creating user' });
    }
  },

  // PUT /api/users/:id
  async updateUser(req: Request, res: Response) {
    try {
        const id = req.params['id'] as string;
      const user = await userService.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user' });
    }
  },

  // DELETE /api/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
        const id = req.params['id'] as string;
      const deleted = await userService.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  }
};