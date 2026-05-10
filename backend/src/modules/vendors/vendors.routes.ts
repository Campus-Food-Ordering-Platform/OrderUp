console.log("VENDORS ROUTE FILE LOADED");
import { Router } from 'express';
import * as vendorController from '././vendor.controller';
import {
  approveApplicationHandler,
  rejectApplicationHandler,
} from './vendor.controller';
const router = Router();

router.post('/applications/:id/approve', approveApplicationHandler);
router.post('/applications/:id/reject', rejectApplicationHandler);

//admin
router.get('/applications/pending', vendorController.getPendingApplications);
router.get('/admin/all', vendorController.getAllVendorsAdmin);
router.patch('/:id/status', vendorController.updateVendorStatus);

// Vendors

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.post('/applications', vendorController.submitVendorApplication);
router.post('/register', vendorController.registerVendor);
router.post('/status', vendorController.checkVendorStatus);

// Menu
router.get('/:id/menu', vendorController.getVendorMenu);
router.post('/:id/menu', vendorController.createMenuItem);
router.put('/:id/menu/:itemId', vendorController.updateMenuItem);
router.delete('/:id/menu/:itemId', vendorController.deleteMenuItem);



export default router;