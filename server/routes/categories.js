import express from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import { Project } from '../models/Project.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ categoryNumber: 1 });
    const projects = await Project.find().sort({ categoryNumber: 1, projectNumber: 1 });

    // Attach projects array to each category matching frontend Competition structure
    const combined = categories.map(cat => {
      const catObj = cat.toObject();
      catObj.projects = projects.filter(p => p.categoryNumber === cat.categoryNumber);
      return catObj;
    });

    res.json({
      success: true,
      count: combined.length,
      categories: combined
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error while fetching categories.' });
  }
});

// GET /api/projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ categoryNumber: 1, projectNumber: 1 });
    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories - create new category
router.post('/', async (req, res) => {
  try {
    const { name, categoryNumber, challengeTitle, gradeEligibility, description, venueHall } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const catNum = categoryNumber ? Number(categoryNumber) : (await Category.countDocuments()) + 1;
    const catId = req.body.id || `cat-${catNum}`;

    const newCategory = new Category({
      id: catId,
      name,
      categoryNumber: catNum,
      challengeTitle: challengeTitle || name,
      gradeEligibility: gradeEligibility || 'Grades 1 to 12',
      description: description || '',
      venueHall: venueHall || 'Arena Hall A',
      finalistsQuotaPerSchool: 2,
      registeredCount: 0,
      completedCount: 0,
      pendingCount: 0,
      assignedJudgesCount: 2,
      maxScore: 100,
      status: 'UPCOMING',
      ...req.body
    });

    await newCategory.save();
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/categories/:id - update existing category
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }, { categoryNumber: !isNaN(Number(id)) ? Number(id) : -1 }] }
      : { $or: [{ id }, { categoryNumber: !isNaN(Number(id)) ? Number(id) : -1 }] };
    const updated = await Category.findOneAndUpdate(query, { $set: req.body }, { returnDocument: 'after' });
    if (!updated) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json({ success: true, category: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categories/:id - remove category
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }, { categoryNumber: !isNaN(Number(id)) ? Number(id) : -1 }] }
      : { $or: [{ id }, { categoryNumber: !isNaN(Number(id)) ? Number(id) : -1 }] };
    const deleted = await Category.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
