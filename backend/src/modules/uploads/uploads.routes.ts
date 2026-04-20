import { Router, Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET /api/upload/sign
// Returns a signed upload signature for direct frontend → Cloudinary uploads
router.get('/sign', (req: Request, res: Response) => {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'orderup/menu-items' },
    process.env.CLOUDINARY_API_SECRET!
  );

  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// POST /api/upload  ← keeping this for now, can delete later
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