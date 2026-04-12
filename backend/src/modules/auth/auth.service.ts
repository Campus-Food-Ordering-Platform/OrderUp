import pool from '../../config/db';
import { User } from '../users/user.model';

export const authService = {

  // Find user by Auth0 ID
  async findUserByAuth0Id(auth0Id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE auth0_id = $1',
      [auth0Id]
    );
    return result.rows[0] || null;
  },

  // Create a new user
  async createUser(data: {
    auth0Id: string;
    name: string;
    role: 'customer' | 'vendor' | 'admin';
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO profiles (auth0_id, name, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.auth0Id, data.name, data.role]
    );
    return result.rows[0];
  },

  // Get or create user
  async getOrCreateUser(data: {
    auth0Id: string;
    name: string;
    role: 'customer' | 'vendor' | 'admin';
  }): Promise<{ user: User; isNew: boolean }> {
    const existingUser = await authService.findUserByAuth0Id(data.auth0Id);
    if (existingUser) {
      return { user: existingUser, isNew: false };
    }
    const newUser = await authService.createUser(data);
    return { user: newUser, isNew: true };
  }
};