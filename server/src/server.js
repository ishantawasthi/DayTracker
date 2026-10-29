import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import studyRoutes from './routes/studyRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Resolve client dist path across various deployment environments
const candidatePaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../dist')
];
const clientDistPath = candidatePaths.find((p) => fs.existsSync(p));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'DayTrack API',
    commit: process.env.RENDER_GIT_COMMIT || 'local',
    distFound: !!clientDistPath,
    timestamp: new Date().toISOString()
  });
});


// Serve frontend client dist if present (for single-service deployment)
if (clientDistPath) {
  app.use(express.static(clientDistPath));

  // Asset fallback: if a cached browser requests an old bundle hash, serve the current asset
  // instead of letting it fall through to index.html (which causes SyntaxError: Unexpected token '<')
  app.get('/assets/:file', (req, res, next) => {
    const assetsDir = path.join(clientDistPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      if (req.params.file.endsWith('.js')) {
        const mainJs = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
        if (mainJs) {
          res.setHeader('Content-Type', 'application/javascript');
          return res.sendFile(path.join(assetsDir, mainJs));
        }
      }
      if (req.params.file.endsWith('.css')) {
        const mainCss = files.find((f) => f.startsWith('index-') && f.endsWith('.css'));
        if (mainCss) {
          res.setHeader('Content-Type', 'text/css');
          return res.sendFile(path.join(assetsDir, mainCss));
        }
      }
    }
    res.status(404).send('Asset not found');
  });

  // Never cache index.html so clients always get the latest bundle hash immediately
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[DayTrack Server Error]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const server = app.listen(PORT, () => {
  console.log(`[DayTrack] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[DayTrack] Port ${PORT} is already in use by another process.`);
    console.error(`[DayTrack] To free it on Windows, run: Stop-Process -Name node -Force`);
    process.exit(1);
  } else {
    console.error('[DayTrack] Server error:', err);
  }
});
