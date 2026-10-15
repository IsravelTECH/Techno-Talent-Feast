import express from 'express';
import School from '../models/School.js';

const router = express.Router();

// GET /api/schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.find().sort({ rank: 1, averageScore: -1 });
    res.json({
      success: true,
      count: schools.length,
      schools
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Server error while fetching schools.' });
  }
});

// GET /api/schools/:id
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findOne({ $or: [{ id: req.params.id }, { code: req.params.id }] });
    if (!school) {
      return res.status(404).json({ error: 'School not found.' });
    }
    res.json({ success: true, school });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
