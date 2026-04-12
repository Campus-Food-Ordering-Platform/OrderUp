import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import userRoutes from './modules/users/user.routes';
import authRoutes from './modules/auth/auth.routes';
const app = express();

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
export default app;