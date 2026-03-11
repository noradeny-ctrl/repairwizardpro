import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import admin from 'firebase-admin';
import analyzeHandler from './api/analyze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

app.use(express.json());

// --- Firebase Admin Initialization ---
let firebaseAdminApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (!firebaseAdminApp) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT is not set. Firebase Admin features will be disabled.');
      throw new Error('FIREBASE_SERVICE_ACCOUNT is required for this operation.');
    }
    
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully.');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }
  return firebaseAdminApp;
}

// --- Authentication Middleware ---
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// --- Auth Endpoints ---
app.get('/api/admin/health', async (req, res) => {
  try {
    const adminApp = getFirebaseAdmin();
    res.json({ status: 'ok', project: adminApp.options.projectId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/api/analyze', analyzeHandler);

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role: 'PendingUser',
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Protected Dealer Endpoints ---
app.post('/api/dealer/register', authenticateToken, upload.single('businessLicense'), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { dealershipName, country, city, contactPhone } = req.body;
    const businessLicenseUrl = req.file?.path;

    if (!dealershipName || !country || !city || !contactPhone || !businessLicenseUrl) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const dealerProfile = await prisma.dealerProfile.create({
      data: {
        userId,
        dealershipName,
        country,
        city,
        contactPhone,
        businessLicenseUrl,
      },
    });

    res.status(201).json(dealerProfile);
  } catch (error) {
    console.error('Dealer registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/dealer/pending', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const pendingDealers = await prisma.dealerProfile.findMany({
      where: { verificationStatus: 'PENDING' },
    });
    res.json(pendingDealers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/admin/dealer/:id/status', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const updatedDealer = await prisma.dealerProfile.update({
      where: { id: id as string },
      data: {
        verificationStatus: status,
        reviewDate: new Date(),
      },
    });

    // If approved, upgrade user role
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: updatedDealer.userId },
        data: { role: 'VerifiedDealer' },
      });
    }

    res.json(updatedDealer);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

// Catch-all route for SPA
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  // In production, serve index.html. In dev, Vite handles it.
  if (process.env.NODE_ENV === 'production') {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Production build not found. Please run npm run build.');
    }
  } else {
    next();
  }
});

startServer();
