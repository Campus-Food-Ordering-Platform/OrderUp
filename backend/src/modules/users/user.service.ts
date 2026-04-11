import { User } from '../users/user.model';

// This is a temporary in-memory store, will be replaced with Firebase/azure later
const users: User[] = [];

export const userService = {

  // Get all users
  async getAllUsers(): Promise<User[]> {
    return users;
  },

  // Get a single user by ID
  async getUserById(id: string): Promise<User | null> {
    const user = users.find(u => u.id === id);
    return user || null;
  },

  // Create a new user
  async createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36).substring(2),  // temp ID generator
      ...data,
      createdAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  // Update a user
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
      const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  const existingUser = users[index]!; // ! tells TypeScript we know it exists
  users[index] = { ...existingUser, ...data };
  return users[index]!;
  },

  // Delete a user
  async deleteUser(id: string): Promise<boolean> {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  }
};