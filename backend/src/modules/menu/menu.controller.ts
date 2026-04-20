import { Request, Response } from 'express';
import {
    addMenuItem,
    getMenuItemsByVendor,
    deleteMenuItem,
    updateMenuItem
} from './menu.service';

export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const { vendorId, name, description, price } = req.body;
        const item = await addMenuItem(vendorId, name, description, price);
        res.status(201).json(item);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const items = await getMenuItemsByVendor(Number(vendorId));
        res.json(items);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const removeMenuItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        await deleteMenuItem(Number(itemId));
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const modifyMenuItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { name, description, price } = req.body;
        const item = await updateMenuItem(Number(itemId), name, description, price);
        res.json(item);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};