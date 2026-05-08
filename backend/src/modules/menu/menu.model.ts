export interface MenuItem {
    id: number;
    vendor_id: number;
    name: string;
    description: string;
    price: number;
    available: boolean;
    image_url: string;
    category: string;
}