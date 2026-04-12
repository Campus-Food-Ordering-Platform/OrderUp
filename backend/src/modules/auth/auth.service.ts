import pool from '../../config/db';
import { User } from '../users/user.model';

export const authService = {

  // Find a user by their Azure ID
  async findUserByAzureId(azureId: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE azure_id = $1',
      [azureId]
    );
    return result.rows[0] || null;
  },

  // Find a user by email
  async findUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Create a new user after Google/Azure login
  async createUser(data: {
    azureId: string;
    name: string;
    email: string;
    role: 'customer' | 'vendor' | 'admin';
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (azure_id, name, email, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.azureId, data.name, data.email, data.role]
    );
    return result.rows[0];
  },

  // Get or create user (main signup/login logic)
  async getOrCreateUser(data: {
    azureId: string;
    name: string;
    email: string;
    role: 'customer' | 'vendor' | 'admin';
  }): Promise<{ user: User; isNew: boolean }> {
    // Check if user already exists
    const existingUser = await authService.findUserByAzureId(data.azureId);
    if (existingUser) {
      return { user: existingUser, isNew: false };
    }

    // Create new user if they don't exist
    const newUser = await authService.createUser(data);
    return { user: newUser, isNew: true };
  }
};