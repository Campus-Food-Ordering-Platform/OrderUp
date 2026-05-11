import * as vendorRepo from '././vendor.repository';
import { insertMenuItem, updateMenuItemById, findMenuItemsByVendor } from '../menu/menu.repository';


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
/*
export const createMenuItem = (vendorId: string, body: any) => {
  if (!body.name || !body.price) {
    throw new ValidationError('Name and price required');
  }
  return vendorRepo.createMenuItem(vendorId, body);
};

export const updateMenuItem = (vendorId: string, itemId: string, body: any) => {
  return vendorRepo.updateMenuItem(vendorId, itemId, body);
};
*/
export const createMenuItem = async (vendorId: string, body: any) => {
  if (!body.name || !body.price) {
    throw new ValidationError('Name and price required');
  }
  return insertMenuItem(
    vendorId,
    body.name,
    body.description ?? null,
    body.price,
    body.image_url ?? null,
    body.category ?? null,
    body.available ?? true,
    body.allergens ?? [],
    body.tags ?? []
  );
};

export const updateMenuItem = async (vendorId: string, itemId: string, body: any) => {
  return updateMenuItemById(
    itemId,
    body.name,
    body.description ?? null,
    body.price,
    body.image_url ?? null,
    body.category ?? null,
    body.available ?? true,
    body.allergens ?? [],
    body.tags ?? []
  );
};
export const deleteMenuItem = (vendorId: string, itemId: string) => {
  return vendorRepo.deleteMenuItem(vendorId, itemId);
};

// ───────────── Register ─────────────

export const registerVendor = (body: any) => {
  if (!body.profile_id) {
    throw new  ValidationError('profile_id is required');
  }
  return vendorRepo.registerVendor(body);
};
export const submitVendorApplication = (body: any) => {
  if (!body.profile_id) throw new ValidationError('profile_id is required');
  if (!body.name)       throw new ValidationError('Vendor name is required');
  if (!body.category)   throw new ValidationError('Category is required');
  return vendorRepo.submitVendorApplication(body);
};
export const getVendorStatusByProfileId = (profileId: string) => {
  return vendorRepo.getVendorStatusByProfileId(profileId);
};

// ───────────── admin ─────────────

export const updateVendorStatus = (vendorId: string, status: 'active' | 'suspended') => {
  if (!['active', 'suspended'].includes(status)) {
    throw new ValidationError('Invalid status value');
  }
  return vendorRepo.updateVendorStatus(vendorId, status);
};

export const getAllVendorsAdmin = () => {
  return vendorRepo.getAllVendorsAdmin();
};

export const approveApplication = (applicationId: string) => {
  return vendorRepo.approveApplication(applicationId);
};

export const rejectApplication = (applicationId: string, rejectionReason?: string) => {
  if (!applicationId) throw new ValidationError('Application ID is required');
  return vendorRepo.rejectApplication(applicationId, rejectionReason);
};
export const getPendingApplications = () => {
  return vendorRepo.getPendingApplications();
};