import express, { Request, Response } from 'express';
import userRoutes from './modules/users/user.routes';

const app = express();

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/users', userRoutes);
export default app;