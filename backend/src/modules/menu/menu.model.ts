export interface MenuItem {
    id: number;
    vendor_id: number;
    name: string;
    description: string;
    price: number;
    available: boolean;
    created_at: Date;
}