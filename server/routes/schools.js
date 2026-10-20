import express from 'express';
import mongoose from 'mongoose';
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

// POST /api/schools - create new school
router.post('/', async (req, res) => {
  try {
    const { name, code, city, country, principalName, coordinatorName, contactNumber, email } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'School name is required.' });
    }

    const schoolId = req.body.id || `sch-${Date.now().toString(36)}`;
    const schoolCode = code || name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();

    // Default category quotas (2 per category for categories 1 to 6 = 12 total)
    const categoryQuotas = [
      { categoryNumber: 1, categoryName: 'Category 1: ICT Challenge', required: 2, selected: 0, status: 'PENDING' },
      { categoryNumber: 2, categoryName: 'Category 2: Coding Challenge', required: 2, selected: 0, status: 'PENDING' },
      { categoryNumber: 3, categoryName: 'Category 3: Creative Technology Challenge', required: 2, selected: 0, status: 'PENDING' },
      { categoryNumber: 4, categoryName: 'Category 4: Artificial Intelligence Challenge', required: 2, selected: 0, status: 'PENDING' },
      { categoryNumber: 5, categoryName: 'Category 5: Digital Solutions Challenge', required: 2, selected: 0, status: 'PENDING' },
      { categoryNumber: 6, categoryName: 'Category 6: Innovation Challenge', required: 2, selected: 0, status: 'PENDING' }
    ];

    const newSchool = new School({
      id: schoolId,
      name,
      code: schoolCode,
      city: city || 'Dubai',
      country: country || 'UAE',
      principalName: principalName || '',
      coordinatorName: coordinatorName || '',
      contactNumber: contactNumber || '',
      email: email || '',
      categoryQuotas: req.body.categoryQuotas || categoryQuotas,
      ...req.body
    });

    await newSchool.save();
    res.status(201).json({ success: true, school: newSchool });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/schools/:id - update existing school
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }, { code: id }] }
      : { $or: [{ id }, { code: id }] };
    const updated = await School.findOneAndUpdate(query, { $set: req.body }, { returnDocument: 'after' });
    if (!updated) {
      return res.status(404).json({ error: 'School not found.' });
    }
    res.json({ success: true, school: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/schools/:id - remove school
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }, { code: id }] }
      : { $or: [{ id }, { code: id }] };
    const deleted = await School.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: 'School not found.' });
    }
    res.json({ success: true, message: 'School removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
