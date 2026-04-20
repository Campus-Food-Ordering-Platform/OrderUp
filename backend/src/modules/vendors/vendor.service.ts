import { getAllVendors } from '../vendors/vendor.repository';

export const fetchAllVendors = async () => {
  return await getAllVendors();
};