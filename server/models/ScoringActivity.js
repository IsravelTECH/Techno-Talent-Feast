import mongoose from 'mongoose';

const scoringActivitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  judgeName: { type: String, required: true },
  judgeAvatar: { type: String, default: '' },
  action: { type: String, required: true },
  participantName: { type: String, required: true },
  competitionName: { type: String, required: true },
  score: { type: Number, default: 0 },
  timestamp: { type: String, required: true },
  timeAgo: { type: String, default: 'Just now' },
  time: { type: String, default: '' }
}, {
  timestamps: true
});

export const ScoringActivity = mongoose.model('ScoringActivity', scoringActivitySchema);
