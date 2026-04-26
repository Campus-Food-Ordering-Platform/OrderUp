import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import menuRoutes from './modules/menu/menu.routes';
import userRoutes from './modules/users/user.routes';
import authRoutes from './modules/auth/auth.routes';
import cartRoutes from './modules/cart/cart.routes';
import vendorRoutes from './modules/vendors/vendors.routes';
import uploadRoutes from './modules/uploads/uploads.routes';
import orderRoutes from '././modules/orders/order.routes';
import paymentRoutes from './modules/payments/payment.routes';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://order-up-rho.vercel.app'
  ],
  credentials: true
}));

// Body limits must come BEFORE routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;