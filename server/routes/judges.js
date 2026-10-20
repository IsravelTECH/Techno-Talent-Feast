import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

const getJudgeQuery = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ id }, { judgeId: id }, { _id: id }] }
    : { $or: [{ id }, { judgeId: id }] };
};

const TITLE_PREFIXES = /^(dr|prof|eng|engr|mr|mrs|ms|miss|er|hon)\.?\s+/i;

function extractJudgeFirstName(fullName) {
  if (!fullName) return 'Judge';
  const clean = fullName.trim().replace(TITLE_PREFIXES, '').trim();
  const parts = clean.split(/\s+/);
  const first = parts[0] || 'Judge';
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function generateJudgePassword(judgeId, fullName) {
  const cleanId = (judgeId || 'JDG-01').toUpperCase().trim();
  const firstName = extractJudgeFirstName(fullName);
  return `${cleanId}-${firstName}`;
}

// GET /api/judges - list all judges
router.get('/', async (req, res) => {
  try {
    const rawJudges = await User.find({ role: 'judge' }).sort({ createdAt: -1 });
    const judges = rawJudges.map((j) => {
      const obj = j.toObject ? j.toObject() : { ...j };
      const generatedPass = generateJudgePassword(obj.judgeId, obj.name);
      if (!obj.password || obj.password === '123456') {
        obj.password = generatedPass;
      }
      return obj;
    });
    res.json({
      success: true,
      count: judges.length,
      judges
    });
  } catch (error) {
    console.error('Error fetching judges:', error);
    res.status(500).json({ error: 'Server error while fetching judges.' });
  }
});

// POST /api/judges - create new judge (Admin capability)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Judge name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: `User with email "${cleanEmail}" already exists.` });
    }

    // Auto-generate judgeId (e.g. JDG-09, JDG-10)
    const count = await User.countDocuments({ role: 'judge' });
    const judgeId = `JDG-${String(count + 1).padStart(2, '0')}`;
    const id = `jdg-${Date.now()}`;
    const generatedPass = generateJudgePassword(judgeId, name);
    const finalPassword = password && password.trim() !== '123456' ? password.trim() : generatedPass;

    const newJudge = new User({
      id,
      judgeId,
      name: name.trim(),
      email: cleanEmail,
      password: finalPassword,
      role: 'judge',
      status: 'ACTIVE'
    });

    await newJudge.save();

    res.status(201).json({
      success: true,
      message: `Judge "${newJudge.name}" created successfully with ID ${newJudge.judgeId}.`,
      judge: newJudge
    });
  } catch (error) {
    console.error('Error creating judge:', error);
    res.status(500).json({ error: 'Server error while creating judge.' });
  }
});

// PUT /api/judges/:id - update judge
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = getJudgeQuery(id);
    const updated = await User.findOneAndUpdate(
      query,
      { $set: req.body },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Judge not found.' });
    }

    res.json({ success: true, judge: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/judges/:id - delete judge
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = getJudgeQuery(id);
    const deleted = await User.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({ error: 'Judge not found.' });
    }

    res.json({ success: true, message: 'Judge removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
