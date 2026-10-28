import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const router = express.Router();

// Initial seed notifications if collection is empty
const SEED_NOTIFICATIONS = [
  {
    id: 'notif-01',
    title: 'Grand Finale Evaluation Live',
    message: 'Dr. Priya Sharma submitted Category 6 evaluation for Priya Raj & Team (96/100).',
    timestamp: '2 min ago',
    timeAgo: '2m',
    type: 'score',
    isRead: false,
    actionLink: 'results',
    recipientRole: 'admin'
  },
  {
    id: 'notif-02',
    title: 'Finalist Quotas Verified',
    message: 'GEMS Modern Academy confirmed with exact 12-finalist team delegation.',
    timestamp: '15 min ago',
    timeAgo: '15m',
    type: 'competition',
    isRead: false,
    actionLink: 'participants',
    recipientRole: 'admin'
  },
  {
    id: 'notif-03',
    title: 'Official Announcement Broadcast',
    message: 'Chief Convener James Techno published Grand Finale evaluation notice.',
    timestamp: '30 min ago',
    timeAgo: '30m',
    type: 'announcement',
    isRead: true,
    actionLink: 'scoring',
    recipientRole: 'judge'
  }
];

// Deduplicate helper: removes duplicate notifications with identical title/message within a time window
async function cleanupDuplicateNotifications() {
  try {
    const all = await Notification.find().sort({ createdAt: -1 });
    const seen = new Set();
    const toDeleteIds = [];

    for (const item of all) {
      // Create a semantic key: if team ID is present (e.g. TTF26-TEAM-001), group by team
      const teamMatch = (item.message || '').match(/TTF26-(?:TEAM|PART)-\d+/i);
      const normMsg = (item.message || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const key = teamMatch
        ? `${item.type}|${item.title.trim().toLowerCase()}|${teamMatch[0].toUpperCase()}`
        : `${item.title.trim().toLowerCase()}|${normMsg}`;

      if (seen.has(key)) {
        toDeleteIds.push(item._id);
      } else {
        seen.add(key);
      }
    }

    if (toDeleteIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: toDeleteIds } });
    }
  } catch (err) {
    console.warn('Notification cleanup notice:', err);
  }
}

// GET /api/notifications - Fetch all notifications sorted by newest first
router.get('/', async (req, res) => {
  try {
    let count = await Notification.countDocuments();
    if (count === 0) {
      await Notification.insertMany(SEED_NOTIFICATIONS);
    } else {
      await Notification.updateOne({ id: 'notif-01' }, { $set: { recipientRole: 'admin', actionLink: 'results' } });
      await Notification.updateOne({ id: 'notif-02' }, { $set: { recipientRole: 'admin', actionLink: 'participants' } });
      await cleanupDuplicateNotifications();
    }

    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error while fetching notifications.' });
  }
});

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    const result = await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({
      success: true,
      message: 'All notifications marked as read.',
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ error: 'Server error while marking all notifications read.' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const notification = await Notification.findOneAndUpdate(
      query,
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return res.status(404).json({ error: `Notification with id "${id}" not found.` });
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
      notification
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Server error while updating notification.' });
  }
});

// POST /api/notifications - Create a new real notification
router.post('/', async (req, res) => {
  try {
    const { title, message, type, actionLink, recipientRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Deduplicate: check if an identical notification was logged in the last 2 minutes
    const existing = await Notification.findOne({
      title: title.trim(),
      message: message.trim(),
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Notification already recorded.',
        notification: existing
      });
    }

    const newNotification = new Notification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      timestamp,
      timeAgo: 'Just now',
      type: type || 'system',
      isRead: false,
      actionLink: actionLink || '',
      recipientRole: recipientRole || 'ALL'
    });

    await newNotification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully.',
      notification: newNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Server error while creating notification.' });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    await Notification.findOneAndDelete(query);
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Server error while deleting notification.' });
  }
});

export default router;
