export type UserRole = 'customer' | 'vendor' | 'admin';
export type VendorStatus = 'pending' | 'approved' | 'suspended';

export interface User {
  id: string;
  auth0_id: string;
  name: string;
  role: UserRole;
  vendor_status?: VendorStatus;
  created_at: Date;
}