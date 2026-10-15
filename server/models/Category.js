import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  categoryNumber: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  challengeTitle: {
    type: String,
    required: true
  },
  gradeEligibility: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  finalistsQuotaPerSchool: {
    type: Number,
    default: 2
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  pendingCount: {
    type: Number,
    default: 0
  },
  assignedJudgesCount: {
    type: Number,
    default: 6
  },
  timeLimit: {
    type: String,
    default: '15 Min Defense'
  },
  maxScore: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    default: 'LIVE'
  },
  icon: {
    type: String,
    default: 'Award'
  },
  venueHall: {
    type: String,
    default: 'EIBFS Main Arena'
  },
  rubricId: {
    type: String,
    default: 'official-ttf-rubric'
  },
  allowedTools: [{
    type: String
  }]
}, {
  timestamps: true
});

export const Category = mongoose.model('Category', CategorySchema);
export default Category;
