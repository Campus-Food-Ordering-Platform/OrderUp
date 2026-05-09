import { MenuItem } from './menu.model';
import {
    insertMenuItem,
    findMenuItemsByVendor,
    removeMenuByVendorId,
    updateMenuItemById
} from './menu.repository';

export const addMenuItem = async (
    vendorId: string,
    name: string,
    description: string,
    price: number,
    image_url: string
): Promise<MenuItem> => {
    if (!name || !price || !vendorId) {
        throw new Error('vendorId, name and price are required');
    }
    if (price <= 0) {
        throw new Error('Price must be greater than zero');
    }
    return await insertMenuItem(vendorId, name, description, price, image_url);
};

export const getMenuItemsByVendor = async (vendorId: string): Promise<MenuItem[]> => {
    return await findMenuItemsByVendor(vendorId);
};

export const deleteMenuItem = async (vendor_id: string): Promise<void> => {
    await removeMenuByVendorId(vendor_id);
};  

export const updateMenuItem = async (
    itemId: string,
    name: string,
    description: string,
    price: number,
    image_url: string,
): Promise<MenuItem> => {
    return await updateMenuItemById(itemId, name, description, price, image_url);
};