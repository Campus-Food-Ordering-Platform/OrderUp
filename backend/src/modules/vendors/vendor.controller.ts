import { Request, Response } from 'express';
import * as vendorService from './vendor.service';
import { ValidationError } from './vendor.service';

// ───────────── Vendors ─────────────

export const getAllVendors = async (_req: Request, res: Response) => {
  try {
    console.log("HIT VENDORS ROUTE");
    const data = await vendorService.getAllVendors();
    res.json(data);
  } catch (err) {
    console.log("VENDORS CRASH:", err);
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

// ───────────── admin ─────────────
export const updateVendorStatus = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const data = await vendorService.updateVendorStatus(req.params.id, status);
    if (!data) return res.status(404).json({ error: 'Vendor not found' });
    res.json(data);
  } catch (err) {
    console.error(err);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to update vendor status' });
    }
  }
};

export const getAllVendorsAdmin = async (_req: Request, res: Response) => {
  try {
    const data = await vendorService.getAllVendorsAdmin();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

export const submitVendorApplication = async (req: Request, res: Response) => {
  try {
    const data = await vendorService.submitVendorApplication(req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
};
export const checkVendorStatus = async (req: Request, res: Response) => {
  try {
    const { profile_id } = req.body;
    if (!profile_id) return res.status(400).json({ error: 'profile_id required' });
    const data = await vendorService.getVendorStatusByProfileId(profile_id);
    res.json(data ?? { type: 'none' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check status' });
  }
};

export const approveApplicationHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data = await vendorService.approveApplication(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('approveApplication error:', err);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to approve application' });
    }
  }
};

export const updateVendor = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data = await vendorService.updateVendor(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: 'Vendor not found' });
    res.json(data);
  } catch (err) {
    console.error(err);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to update vendor' });
    }
  }
};

export const rejectApplicationHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { rejection_reason } = req.body;
    const data = await vendorService.rejectApplication(req.params.id, rejection_reason);
    if (!data) return res.status(404).json({ error: 'Application not found' });
    res.json(data);
  } catch (err) {
    console.error('rejectApplication error:', err);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to reject application' });
    }
  }
};
export const getPendingApplications = async (_req: Request, res: Response) => {
  try {
    const data = await vendorService.getPendingApplications();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending applications' });
  }
};