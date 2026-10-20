import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Return sanitized user object
    res.json({
      success: true,
      user: {
        id: user.id || user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        judgeId: user.judgeId || '',
        avatar: user.avatar || '',
        title: user.title || '',
        organization: user.organization || '',
        phone: user.phone || '',
        specialization: user.specialization || '',
        assignedCategories: user.assignedCategories || [],
        assignedCategoryNames: user.assignedCategoryNames || [],
        assignedHall: user.assignedHall || '',
        assignedSlot: user.assignedSlot || '',
        status: user.status || 'ACTIVE'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// GET /api/auth/me/:id
router.get('/me/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { judgeId: id }, { _id: id }] }
      : { $or: [{ id }, { judgeId: id }] };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      success: true,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        judgeId: user.judgeId || '',
        phone: user.phone || '',
        title: user.title || '',
        organization: user.organization || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile/:id - Update profile details (name, email, phone, role)
// ID is strictly non-editable
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { judgeId: id }, { _id: id }] }
      : { $or: [{ id }, { judgeId: id }] };

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (role && ['admin', 'judge'].includes(role)) updateFields.role = role;

    const updatedUser = await User.findOneAndUpdate(query, { $set: updateFields }, { returnDocument: 'after' });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id || updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        judgeId: updatedUser.judgeId || '',
        phone: updatedUser.phone || '',
        status: updatedUser.status || 'ACTIVE'
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
});

// PUT /api/auth/change-password/:id - Separate endpoint for password change
router.put('/change-password/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { judgeId: id }, { _id: id }] }
      : { $or: [{ id }, { judgeId: id }] };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (currentPassword && user.password && user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message || 'Failed to change password.' });
  }
});

export default router;
