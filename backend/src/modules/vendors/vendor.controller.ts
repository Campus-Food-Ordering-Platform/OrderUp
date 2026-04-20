import { Request, Response } from 'express';
import { fetchAllVendors } from '../vendors/vendor.service';

export const getVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await fetchAllVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
};