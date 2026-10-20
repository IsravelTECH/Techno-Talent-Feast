import express from 'express';
import mongoose from 'mongoose';
import Team from '../models/Team.js';

const router = express.Router();

// GET /api/teams/lookup/:query - lookup by Team ID or Participant ID
router.get('/lookup/:query', async (req, res) => {
  try {
    const rawQuery = (req.params.query || '').trim();
    if (!rawQuery) {
      return res.status(400).json({ error: 'Please enter a valid Team ID.' });
    }

    const regex = new RegExp(`^${rawQuery}$`, 'i');

    // 1. Exact match against teamId, participantId, or id
    let team = await Team.findOne({
      $or: [
        { teamId: regex },
        { participantId: regex },
        { id: regex }
      ]
    });

    // 2. Fallback to case-insensitive partial match if not found
    if (!team) {
      team = await Team.findOne({
        $or: [
          { teamId: { $regex: rawQuery, $options: 'i' } },
          { participantId: { $regex: rawQuery, $options: 'i' } },
          { teamName: { $regex: rawQuery, $options: 'i' } }
        ]
      });
    }

    if (!team) {
      return res.status(404).json({
        error: `Team ID "${rawQuery}" not found. Please verify the badge or entered ID.`
      });
    }

    res.json({
      success: true,
      team
    });
  } catch (error) {
    console.error('Error looking up team:', error);
    res.status(500).json({ error: 'Server error while looking up team.' });
  }
});

// GET /api/teams - retrieve all teams with optional query filters
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category) {
      if (!isNaN(Number(category))) {
        filter.categoryNumber = Number(category);
      } else {
        filter.categoryName = { $regex: category, $options: 'i' };
      }
    }

    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }

    if (search) {
      filter.$or = [
        { teamId: { $regex: search, $options: 'i' } },
        { participantId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { teamName: { $regex: search, $options: 'i' } },
        { schoolName: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const teams = await Team.find(filter).sort({ finalScore: -1, createdAt: 1 });
    res.json({
      success: true,
      count: teams.length,
      teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Server error while fetching teams.' });
  }
});

// GET /api/teams/:id - get single team
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const team = await Team.findOne({
      $or: [{ id }, { teamId: id }, { participantId: id }]
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams - register new team
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const teamIdentifier = (data.teamId || data.id || data.participantId || '').trim().toUpperCase();
    const teamName = (data.name || data.teamName || '').trim();

    if (!teamIdentifier || !teamName || !data.schoolName) {
      return res.status(400).json({ error: 'teamId, name, and schoolName are required.' });
    }

    const existing = await Team.findOne({ teamId: teamIdentifier });
    if (existing) {
      return res.status(400).json({ error: 'A team with this Team ID already exists.' });
    }

    const newTeam = new Team({
      ...data,
      id: data.id || teamIdentifier,
      name: teamName,
      teamName: data.teamName || teamName,
      teamId: teamIdentifier,
      projectTitle: data.projectTitle || data.project?.title || 'Assigned Championship Project',
      status: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATED'].includes(data.status) ? data.status : 'PENDING'
    });

    await newTeam.save();
    res.status(201).json({ success: true, team: newTeam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/teams/:id - update team
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { teamId: id }, { _id: id }] }
      : { $or: [{ id }, { teamId: id }] };
    const updated = await Team.findOneAndUpdate(
      query,
      { $set: req.body },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json({ success: true, team: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/teams/:id - remove team
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { teamId: id }, { _id: id }] }
      : { $or: [{ id }, { teamId: id }] };
    const deleted = await Team.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: 'Team not found.' });
    }
    res.json({ success: true, message: 'Team removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
