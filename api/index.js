import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../server/config/db.js';

import authRoutes from '../server/routes/auth.js';
import teamRoutes from '../server/routes/teams.js';
import evaluationRoutes from '../server/routes/evaluations.js';
import judgeRoutes from '../server/routes/judges.js';
import schoolRoutes from '../server/routes/schools.js';
import categoryRoutes from '../server/routes/categories.js';
import dashboardRoutes from '../server/routes/dashboard.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ensure DB connection before handling request, return clean JSON on failure
app.use(async (req, res, next) => {
  // Allow health checks even if DB is still establishing
  if (req.url === '/health' || req.url === '/api/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[Vercel Serverless] DB connection failed:', err.message);
    return res.status(503).json({
      success: false,
      error: 'Database connection failed. Please ensure MongoDB Atlas has Network Access set to 0.0.0.0/0.',
      detail: err.message
    });
  }
});

// Mount Routes under both root ('/') and '/api' to support any Vercel rewrite variation
const registerRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/teams`, teamRoutes);
  app.use(`${prefix}/evaluations`, evaluationRoutes);
  app.use(`${prefix}/judges`, judgeRoutes);
  app.use(`${prefix}/schools`, schoolRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
};

registerRoutes('');
registerRoutes('/api');

app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Techno Talent Fest 2026 API on Vercel is running',
    timestamp: new Date().toISOString()
  });
});

app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Techno Talent Fest 2026 API Server is operational',
    timestamp: new Date().toISOString()
  });
});

// JSON 404 Handler - never returns Express default HTML 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

// JSON Global Error Handler - catches any synchronous or async throw
app.use((err, req, res, next) => {
  console.error('[Vercel Serverless API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
