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
}
export interface CreateOrderDTO {
  vendor_id: string;
  customer_id: string;
  customer_name: string;
  items: { name: string; price: number; quantity: number }[];
  total_amount: number;
  note?: string;
}