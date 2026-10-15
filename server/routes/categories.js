import express from 'express';
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

export default router;
