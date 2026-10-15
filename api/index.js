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

// Cache DB connection across serverless invocations
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] Database connection error:', err.message);
    }
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Techno Talent Feast 2026 API on Vercel is running',
    timestamp: new Date().toISOString()
  });
});

export default app;
