import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { storageService } from '../services/storageService';

export const uploadRouter = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and HEIC are allowed.'));
    }
  },
});

// Upload room photo
uploadRouter.post('/room', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    const fileName = `rooms/${req.userId}/${uuidv4()}.${fileExtension}`;

    const url = await storageService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    res.json({
      url,
      fileName,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error('Room upload failed:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload artwork
uploadRouter.post('/artwork', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    const fileName = `artworks/${req.userId}/${uuidv4()}.${fileExtension}`;

    const url = await storageService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    res.json({
      url,
      fileName,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error('Artwork upload failed:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});
