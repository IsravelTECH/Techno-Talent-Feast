import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { ScoringActivity } from '../models/ScoringActivity.js';
import Notification from '../models/Notification.js';

const router = express.Router();

const RUBRIC_LIMITS = {
  'crit-tech': { name: 'Technical Execution & Functionality', max: 30 },
  'crit-innov': { name: 'Innovation & Problem Solving', max: 25 },
  'crit-design': { name: 'Design & User Experience', max: 20 },
  'crit-demo': { name: 'Live Demonstration & Student Defense', max: 15 },
  'crit-doc': { name: 'Documentation & Compliance', max: 10 }
};

// POST /api/evaluations/submit - Submit marks for a team
router.post('/submit', async (req, res) => {
  try {
    const {
      teamId,
      criterionScores,
      judgeRemarks,
      judgeId,
      judgeName,
      judgeEmail
    } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required.' });
    }

    if (!criterionScores || typeof criterionScores !== 'object') {
      return res.status(400).json({ error: 'Criterion scores are required.' });
    }

    // Find the team
    const team = await Team.findOne({
      $or: [
        { teamId: new RegExp(`^${teamId.trim()}$`, 'i') },
        { id: teamId },
        { participantId: new RegExp(`^${teamId.trim()}$`, 'i') }
      ]
    });

    if (!team) {
      return res.status(404).json({ error: `Team with ID "${teamId}" was not found.` });
    }

    // Validate scores
    let totalScore = 0;
    const validatedScores = {};

    for (const [key, meta] of Object.entries(RUBRIC_LIMITS)) {
      const val = criterionScores[key];
      if (val === undefined || val === null || val === '') {
        return res.status(400).json({
          error: `Missing score for "${meta.name}". Please provide all 5 criteria.`
        });
      }

      const numVal = Number(val);
      if (isNaN(numVal) || numVal < 0 || numVal > meta.max) {
        return res.status(400).json({
          error: `Invalid mark for "${meta.name}". Must be between 0 and ${meta.max}.`
        });
      }

      validatedScores[key] = numVal;
      totalScore += numVal;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update team document
    team.criterionScores = validatedScores;
    team.finalScore = totalScore;
    team.percentage = totalScore;
    team.status = 'SUBMITTED';
    team.judgeRemarks = (judgeRemarks || '').trim();
    team.evaluatedByJudgeId = judgeId || team.assignedJudgeId || 'JDG-01';
    team.evaluatedByJudgeName = judgeName || team.assignedJudgeName || 'Official Competition Judge';
    team.submissionTimestamp = timestamp;

    await team.save();

    // Log scoring activity
    const activity = new ScoringActivity({
      id: `act-${Date.now()}`,
      judgeName: team.evaluatedByJudgeName,
      judgeAvatar: '',
      action: 'Evaluated & Submitted Marks',
      participantName: team.name,
      participantId: team.id || team.participantId,
      teamId: team.teamId || team.participantId,
      categoryNumber: team.categoryNumber,
      competitionName: team.categoryName || team.competitionName,
      score: totalScore,
      timestamp: timestamp,
      timeAgo: 'Just now',
      time: timestamp
    });
    await activity.save();

    // Log real notification for administration (guaranteed single record)
    const teamIdentifier = team.teamId || team.participantId;
    let newNotif = await Notification.findOne({
      title: 'Score Submitted by Juror',
      message: { $regex: teamIdentifier, $options: 'i' },
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (newNotif) {
      newNotif.message = `Juror ${team.evaluatedByJudgeName} submitted official score: ${totalScore}/100 for Team ${teamIdentifier} (${team.name}).`;
      newNotif.timestamp = timestamp;
      newNotif.isRead = false;
      await newNotif.save();
    } else {
      newNotif = new Notification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Score Submitted by Juror',
        message: `Juror ${team.evaluatedByJudgeName} submitted official score: ${totalScore}/100 for Team ${teamIdentifier} (${team.name}).`,
        timestamp: timestamp,
        timeAgo: 'Just now',
        type: 'score',
        isRead: false,
        actionLink: 'results',
        recipientRole: 'admin'
      });
      await newNotif.save();
    }

    // Update judge counts if judgeId provided
    if (judgeId) {
      await User.findOneAndUpdate(
        { $or: [{ id: judgeId }, { judgeId: judgeId }, { email: judgeEmail }] },
        {
          $inc: { completedCount: 1 },
          $set: { lastActivity: `Scored ${team.teamId} at ${timestamp}` }
        }
      );
    }

    res.json({
      success: true,
      message: `Marks submitted successfully for ${team.teamId} (${team.name}). Total Score: ${totalScore}/100`,
      team,
      activity,
      notification: newNotif
    });
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    res.status(500).json({ error: 'Server error while submitting evaluation.' });
  }
});

export default router;
