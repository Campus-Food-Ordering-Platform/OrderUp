import { OrderStatus } from "./order.status";

export interface Order {
  id: string;
  vendor_id: string;
  customer_id: string;
  customer_name: string;
  items: { name: string; price: number; quantity: number }[];
  total_amount: number;
  note: string | null;
  status: OrderStatus;
  created_at: Date;
  rating?: number;     // 1-5 stars
  review?: string;     // text review
}
export interface CreateOrderDTO {
  vendor_id: string;
  customer_id: string;
  customer_name: string;
  items: { name: string; price: number; quantity: number }[];
  total_amount: number;
  note?: string;
}

// Add this new DTO for rating
export interface RateOrderDTO {
  rating: number;      // 1-5
  review?: string;     // optional text
}