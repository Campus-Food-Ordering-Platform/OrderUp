import dotenv from 'dotenv';

dotenv.config();

export const azureConfig = {
  clientId: process.env.AZURE_CLIENT_ID || '',
  tenantId: process.env.AZURE_TENANT_ID || '',
};