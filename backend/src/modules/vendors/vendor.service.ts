import * as vendorRepo from '././vendor.repository';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  } 
}// this is a custom error class for validation errors

// ───────────── Vendors ─────────────

export const getAllVendors = () => {
  return vendorRepo.getAllVendors();
};

export const getVendorById = (id: string) => {
  return vendorRepo.getVendorById(id);
};

// ───────────── Menu ─────────────

export const getVendorMenu = (vendorId: string) => {
  return vendorRepo.getVendorMenu(vendorId);
};

export const createMenuItem = (vendorId: string, body: any) => {
  if (!body.name || !body.price) {
    throw new Error('Name and price required');
  }
  return vendorRepo.createMenuItem(vendorId, body);
};

export const updateMenuItem = (vendorId: string, itemId: string, body: any) => {
  return vendorRepo.updateMenuItem(vendorId, itemId, body);
};

export const deleteMenuItem = (vendorId: string, itemId: string) => {
  return vendorRepo.deleteMenuItem(vendorId, itemId);
};

// ───────────── Register ─────────────

export const registerVendor = (body: any) => {
  if (!body.profile_id) {
    throw new Error('profile_id is required');
  }
  return vendorRepo.registerVendor(body);
};