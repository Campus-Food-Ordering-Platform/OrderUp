import { MenuItem } from './menu.model';
import {
    insertMenuItem,
    findMenuItemsByVendor,
    removeMenuItemById,
    updateMenuItemById
} from './menu.repository';

export const addMenuItem = async (
    vendorId: number,
    name: string,
    description: string,
    price: number
): Promise<MenuItem> => {
    if (!name || !price || !vendorId) {
        throw new Error('vendorId, name and price are required');
    }
    if (price <= 0) {
        throw new Error('Price must be greater than zero');
    }
    return await insertMenuItem(vendorId, name, description, price);
};

export const getMenuItemsByVendor = async (vendorId: number): Promise<MenuItem[]> => {
    return await findMenuItemsByVendor(vendorId);
};

export const deleteMenuItem = async (itemId: number): Promise<void> => {
    await removeMenuItemById(itemId);
};

export const updateMenuItem = async (
    itemId: number,
    name: string,
    description: string,
    price: number
): Promise<MenuItem> => {
    return await updateMenuItemById(itemId, name, description, price);
};