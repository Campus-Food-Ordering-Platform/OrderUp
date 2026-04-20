import { Router, Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// POST /api/upload
// Body: { base64: 'data:image/jpeg;base64,...' }
// Returns: { url: 'https://res.cloudinary.com/...' }
router.post('/', async (req: Request, res: Response) => {
  const { base64 } = req.body;

  if (!base64) {
    return res.status(400).json({ error: 'base64 image is required' });
  }

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