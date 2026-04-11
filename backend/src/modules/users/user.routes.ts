import { Router } from 'express';
import { userController } from '../users/user.controller';

const router = Router();

// GET all users
router.get('/', userController.getAllUsers);

// GET a single user by ID
router.get('/:id', userController.getUserById);

// POST create a new user
router.post('/', userController.createUser);

// PUT update a user
router.put('/:id', userController.updateUser);

// DELETE a user
router.delete('/:id', userController.deleteUser);

export default router;