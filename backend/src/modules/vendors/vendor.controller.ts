import { Request, Response } from 'express';
import * as vendorService from './vendor.service';
import { ValidationError } from './vendor.service';

// ───────────── Vendors ─────────────

export const getAllVendors = async (_req: Request, res: Response) => {
  try {
    const data = await vendorService.getAllVendors();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

export const getVendorById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data = await vendorService.getVendorById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Vendor not found' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
};

// ───────────── Menu ─────────────

export const getVendorMenu = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data = await vendorService.getVendorMenu(req.params.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

export const createMenuItem = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data = await vendorService.createMenuItem(req.params.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to add menu item' });
    }
  }
};

export const updateMenuItem = async (req: Request<{ id: string; itemId: string }>, res: Response) => {
  try {
    const data = await vendorService.updateMenuItem(
      req.params.id,
      req.params.itemId,
      req.body
    );
    if (!data) return res.status(404).json({ error: 'Menu item not found' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req: Request<{ id: string; itemId: string }>, res: Response) => {
  try {
    await vendorService.deleteMenuItem(req.params.id, req.params.itemId);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// ───────────── Register ─────────────

export const registerVendor = async (req: Request, res: Response) => {
  try {
    const data = await vendorService.registerVendor(req.body);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to register vendor' });
    }
  }
};