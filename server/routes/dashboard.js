import express from 'express';
import Team from '../models/Team.js';
import School from '../models/School.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { ScoringActivity } from '../models/ScoringActivity.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const completedEvaluations = await Team.countDocuments({ status: { $in: ['SUBMITTED', 'EVALUATED'] } });
    const pendingEvaluations = await Team.countDocuments({ status: { $ne: 'SUBMITTED' } });
    const totalSchools = await School.countDocuments();
    const totalJudges = await User.countDocuments({ role: 'judge' });
    const totalCategories = await Category.countDocuments();

    // Calculate overall average score of submitted teams
    const submittedTeams = await Team.find({ status: { $in: ['SUBMITTED', 'EVALUATED'] } });
    let averageScore = 0;
    if (submittedTeams.length > 0) {
      const sum = submittedTeams.reduce((acc, t) => acc + (t.finalScore || 0), 0);
      averageScore = Number((sum / submittedTeams.length).toFixed(1));
    }

    // Top teams / leaderboard
    const topTeams = await Team.find({ status: { $in: ['SUBMITTED', 'EVALUATED'] } })
      .sort({ finalScore: -1 })
      .limit(10);

    // Recent activities
    const recentActivities = await ScoringActivity.find()
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      success: true,
      stats: {
        totalTeams,
        completedEvaluations,
        pendingEvaluations,
        scoringProgress: totalTeams > 0 ? Math.round((completedEvaluations / totalTeams) * 100) : 0,
        totalSchools,
        totalJudges,
        totalCategories: totalCategories || 6,
        averageScore
      },
      topTeams,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard stats.' });
  }
});

// GET /api/dashboard/activities
router.get('/activities', async (req, res) => {
  try {
    const activities = await ScoringActivity.find().sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, count: activities.length, activities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
