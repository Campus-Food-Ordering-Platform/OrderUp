import { Router, Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET /api/upload/sign
router.get('/sign', (req: Request, res: Response) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = (req.query.folder as string) || 'orderup/menu-items';
  const resource_type = (req.query.resource_type as string) || 'image';

  // resource_type is NEVER included in the signature params
  // it only goes in the upload URL and FormData
  const signParams: Record<string, any> = { timestamp, folder };

  const signature = cloudinary.utils.api_sign_request(
    signParams,
    process.env.CLOUDINARY_API_SECRET!
  );

  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    resource_type,
  });
});

// POST /api/upload
// Legacy server-side upload using base64 — kept for backwards compatibility
router.post('/', async (req: Request, res: Response) => {
  const { base64 } = req.body;
  if (!base64) return res.status(400).json({ error: 'base64 image is required' });

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'orderup/menu-items',
    });
    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    const error = err as Error;
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;