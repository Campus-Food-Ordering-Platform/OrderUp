export interface User {
  id: string;
  name: string;
  email: string;       
  role: 'customer' | 'vendor' | 'admin';  
  createdAt: Date;
}