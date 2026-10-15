import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import evaluationRoutes from './routes/evaluations.js';
import judgeRoutes from './routes/judges.js';
import schoolRoutes from './routes/schools.js';
import categoryRoutes from './routes/categories.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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
    message: 'Techno Talent Feast 2026 API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start Server and Database Connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[TTF 2026 Server] Express backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[TTF 2026 Server] Failed to start:', err.message);
    process.exit(1);
  }
};

startServer();
