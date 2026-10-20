import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, default: 'Just now' },
    timeAgo: { type: String, default: 'Just now' },
    type: {
      type: String,
      enum: ['score', 'competition', 'assignment', 'announcement', 'system', 'result'],
      default: 'system'
    },
    isRead: { type: Boolean, default: false },
    actionLink: { type: String, default: '' },
    recipientRole: { type: String, default: 'ALL' }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
