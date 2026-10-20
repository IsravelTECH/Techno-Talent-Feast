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

    // Enforce score locking: If team already submitted and one-time edit permission is NOT granted, block modification
    const isPreviouslySubmitted = team.status === 'SUBMITTED' || team.isScoreLocked;
    if (isPreviouslySubmitted && !team.oneTimeEditAllowed) {
      return res.status(403).json({
        error: 'Marks for this team are locked. Please submit an edit request to Administration to change marks.'
      });
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

    // Update team document and lock marks
    team.criterionScores = validatedScores;
    team.finalScore = totalScore;
    team.percentage = totalScore;
    team.status = 'SUBMITTED';
    team.isScoreLocked = true;
    team.oneTimeEditAllowed = false; // consume one-time permission
    if (team.scoreEditRequest && team.scoreEditRequest.status === 'APPROVED') {
      team.scoreEditRequest.status = 'COMPLETED';
    }
    // Reset tieBreakNotice on submit if score is re-evaluated
    if (team.tieBreakNotice) {
      team.tieBreakNotice.active = false;
    }
    team.judgeRemarks = (judgeRemarks || '').trim();
    team.evaluatedByJudgeId = judgeId || team.assignedJudgeId || 'JDG-01';
    team.evaluatedByJudgeName = judgeName || team.assignedJudgeName || 'Official Competition Judge';
    team.submissionTimestamp = timestamp;

    await team.save();

    // Check for same category ties with other submitted teams
    const catNum = team.categoryNumber;
    const tiedTeams = await Team.find({
      _id: { $ne: team._id },
      categoryNumber: catNum,
      status: 'SUBMITTED',
      finalScore: totalScore
    });

    let tieNotif = null;
    if (tiedTeams.length > 0) {
      const allTiedIds = [team.teamId || team.participantId, ...tiedTeams.map(t => t.teamId || t.participantId)].join(', ');
      const catTitle = team.categoryName || `Category ${catNum}`;
      tieNotif = new Notification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `Same Category Tie Alert: ${catTitle}`,
        message: `${tiedTeams.length + 1} teams tied at score ${totalScore}/100 in ${catTitle}: ${allTiedIds}. Review and send tie-break notices if needed.`,
        timestamp: timestamp,
        timeAgo: 'Just now',
        type: 'tie-alert',
        isRead: false,
        actionLink: 'results',
        recipientRole: 'admin'
      });
      await tieNotif.save();
    }

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
      notification: newNotif,
      tieAlert: tieNotif
    });
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    res.status(500).json({ error: 'Server error while submitting evaluation.' });
  }
});

// POST /api/evaluations/request-edit - Judge sends request to administration to change mark
router.post('/request-edit', async (req, res) => {
  try {
    const { teamId, judgeId, judgeName, reason } = req.body;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required.' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please state the reason for requesting mark adjustment.' });
    }

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

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const jName = judgeName || team.evaluatedByJudgeName || 'Official Juror';
    const jId = judgeId || team.evaluatedByJudgeId || 'JDG-01';

    team.scoreEditRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING',
      requestedByJudgeId: jId,
      requestedByJudgeName: jName,
      reason: reason.trim(),
      requestedAt: timestamp,
      reviewedBy: null,
      reviewedAt: null,
      reviewRemarks: ''
    };

    await team.save();

    // Create high-priority notification for Admin
    const teamIdentifier = team.teamId || team.participantId;
    const notif = new Notification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'Score Edit Request from Juror',
      message: `Juror ${jName} requested to edit marks for Team ${teamIdentifier} (${team.name}). Reason: "${reason.trim()}"`,
      timestamp: timestamp,
      timeAgo: 'Just now',
      type: 'score',
      isRead: false,
      actionLink: 'score-requests',
      recipientRole: 'admin'
    });
    await notif.save();

    res.json({
      success: true,
      message: 'Edit request submitted to Administration successfully.',
      team,
      notification: notif
    });
  } catch (error) {
    console.error('Error requesting score edit:', error);
    res.status(500).json({ error: 'Server error while requesting score edit.' });
  }
});

// GET /api/evaluations/requests - Fetch all score edit requests for Administration
router.get('/requests', async (req, res) => {
  try {
    const teamsWithRequests = await Team.find({
      'scoreEditRequest.status': { $in: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] }
    }).sort({ updatedAt: -1 });

    const requests = teamsWithRequests.map(t => ({
      teamId: t.teamId,
      participantId: t.participantId,
      name: t.name,
      teamName: t.teamName,
      schoolName: t.schoolName,
      categoryName: t.categoryName,
      projectTitle: t.projectTitle,
      teamMembers: t.teamMembers,
      finalScore: t.finalScore,
      criterionScores: t.criterionScores,
      oneTimeEditAllowed: t.oneTimeEditAllowed,
      scoreEditRequest: t.scoreEditRequest,
      tieBreakNotice: t.tieBreakNotice
    }));

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching score edit requests:', error);
    res.status(500).json({ error: 'Server error while fetching score edit requests.' });
  }
});

// POST /api/evaluations/send-tie-alert - Administration sends alert to Judge for tied teams
router.post('/send-tie-alert', async (req, res) => {
  try {
    const { teamId, judgeId, message, adminName } = req.body;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required.' });
    }

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

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const adm = adminName || 'Administration';
    const alertMsg = message || `Tie detected in Category ${team.categoryNumber || ''} at ${team.finalScore} marks. Please request a score edit to re-evaluate and break the tie.`;

    const targetJudgeId = (judgeId || team.evaluatedByJudgeId || team.assignedJudgeId || '').trim();
    const targetJudgeName = (req.body.judgeName || team.evaluatedByJudgeName || team.assignedJudgeName || '').trim();

    team.tieBreakNotice = {
      active: true,
      targetJudgeId: targetJudgeId || null,
      targetJudgeName: targetJudgeName || null,
      tiedScore: team.finalScore,
      adminMessage: alertMsg,
      notifiedAt: timestamp,
      notifiedBy: adm,
      categoryNumber: team.categoryNumber
    };

    await team.save();

    // Create Notification targeted strictly to this Judge
    const notif = new Notification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'Tie-Break Notice from Administration',
      message: `Admin Notice for Team ${team.teamId} (${team.name}): ${alertMsg}`,
      timestamp: timestamp,
      timeAgo: 'Just now',
      type: 'tie-alert',
      isRead: false,
      actionLink: 'scoring',
      recipientRole: targetJudgeId || 'judge'
    });
    await notif.save();

    res.json({
      success: true,
      message: `Tie-break alert successfully dispatched to Judge for Team ${team.teamId}.`,
      team,
      notification: notif
    });
  } catch (error) {
    console.error('Error sending tie-break alert:', error);
    res.status(500).json({ error: 'Server error while sending tie-break alert.' });
  }
});

// PATCH /api/evaluations/requests/:teamId/respond - Admin approves or rejects edit request
router.patch('/requests/:teamId/respond', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { action, remarks, adminName } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'Action must be APPROVE or REJECT.' });
    }

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

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const adm = adminName || 'Administration';

    if (action === 'APPROVE') {
      team.oneTimeEditAllowed = true;
      if (team.scoreEditRequest) {
        team.scoreEditRequest.status = 'APPROVED';
        team.scoreEditRequest.reviewedBy = adm;
        team.scoreEditRequest.reviewedAt = timestamp;
        team.scoreEditRequest.reviewRemarks = remarks || 'Approved for one-time score recalibration.';
      }

      // Notify system / Juror
      const notif = new Notification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Score Edit Approved by Administration',
        message: `Administration approved one-time score edit for Team ${team.teamId} (${team.name}). Juror can now adjust marks once.`,
        timestamp: timestamp,
        timeAgo: 'Just now',
        type: 'score',
        isRead: false,
        actionLink: 'scoring',
        recipientRole: 'ALL'
      });
      await notif.save();
    } else {
      team.oneTimeEditAllowed = false;
      if (team.scoreEditRequest) {
        team.scoreEditRequest.status = 'REJECTED';
        team.scoreEditRequest.reviewedBy = adm;
        team.scoreEditRequest.reviewedAt = timestamp;
        team.scoreEditRequest.reviewRemarks = remarks || 'Rejected by administration.';
      }

      const notif = new Notification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Score Edit Request Declined',
        message: `Administration declined score edit request for Team ${team.teamId} (${team.name}). Current score remains certified.`,
        timestamp: timestamp,
        timeAgo: 'Just now',
        type: 'score',
        isRead: false,
        actionLink: 'scoring',
        recipientRole: 'ALL'
      });
      await notif.save();
    }

    await team.save();

    res.json({
      success: true,
      message: action === 'APPROVE'
        ? `Score edit request accepted. Team ${team.teamId} is unlocked for 1-time editing.`
        : `Score edit request rejected for Team ${team.teamId}.`,
      team
    });
  } catch (error) {
    console.error('Error responding to score edit request:', error);
    res.status(500).json({ error: 'Server error while responding to score edit request.' });
  }
});

export default router;
