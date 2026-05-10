import { MenuItem } from './menu.model';
import {
    insertMenuItem,
    findMenuItemsByVendor,
    removeMenuItemByitemId,
    updateMenuItemById
} from './menu.repository';
import { MenuCategory } from '../../types/enums';


export const addMenuItem = async (
    vendorId: string,
    name: string,
    description: string,
    price: number,
    image_url: string,
    category: MenuCategory,
    available: boolean,
    allergens: string[] = [],
    tags: string[] = []
): Promise<MenuItem> => {
    if (!vendorId || !name || !category) {
        throw new Error('vendorId, name and category are required');
    }
    if (price <= 0) {
        throw new Error('Price must be greater than zero');
    }
    return await insertMenuItem(vendorId, name, description, price, image_url, category, available, allergens, tags);
};

export const getMenuItemsByVendor = async (vendorId: string): Promise<MenuItem[]> => {
    return await findMenuItemsByVendor(vendorId);
};

export const deleteMenuItem = async (itemId: string): Promise<void> => {
    await removeMenuItemByitemId(itemId);
};  

export const updateMenuItem = async (
    itemId: string,
    name: string,
    description: string,
    price: number,
    image_url: string,
    category: MenuCategory,
    available: boolean,
    allergens: string[] = [],
    tags: string[] = []
): Promise<MenuItem> => {
    return await updateMenuItemById(itemId, name, description, price, image_url, category, available, allergens, tags);
};