import { Router } from 'express';
import * as vendorController from '././vendor.controller';

const router = Router();

// Vendors
router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.post('/register', vendorController.registerVendor);

// Menu
router.get('/:id/menu', vendorController.getVendorMenu);
router.post('/:id/menu', vendorController.createMenuItem);
router.put('/:id/menu/:itemId', vendorController.updateMenuItem);
router.delete('/:id/menu/:itemId', vendorController.deleteMenuItem);

export default router;