import { MenuCategory } from '../../types/enums';

export interface MenuItem {
    id: string;
    vendor_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: MenuCategory;
    available: boolean;
    allergens: string[];
    tags: string[];
}