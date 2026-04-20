import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next(); // vendor is logged in, let them through
    }
    res.status(401).json({ error: 'Please log in first' });
};