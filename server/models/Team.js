import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: Number, default: 0 },
  role: { type: String, default: '' }
}, { _id: false });

const TeamSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  teamId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  participantId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: { type: String, default: 'Male' },
  grade: { type: Number, default: 8 },
  teamName: {
    type: String,
    default: '',
    trim: true
  },
  teamSize: { type: Number, default: 1 },
  teamMembers: [TeamMemberSchema],
  isGroupProject: { type: Boolean, default: true },
  schoolId: {
    type: String,
    default: 'sch-01'
  },
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  city: { type: String, default: 'Dubai' },
  categoryNumber: {
    type: Number,
    required: true,
    default: 1
  },
  categoryName: {
    type: String,
    required: true,
    trim: true
  },
  competitionId: {
    type: String,
    default: 'cat-1'
  },
  competitionName: {
    type: String,
    default: ''
  },
  projectNumber: {
    type: Number,
    default: 1
  },
  projectTitle: {
    type: String,
    required: true,
    trim: true
  },
  selectedProjectTitle: {
    type: String,
    default: ''
  },
  projectSummary: {
    type: String,
    default: ''
  },
  softwareUsed: {
    type: String,
    default: ''
  },
  filesSubmitted: [{ type: String }],
  isGrandFinalist: { type: Boolean, default: true },
  stage: { type: String, default: 'STAGE_2_FINALE' },
  assignedJudgeId: { type: String, default: '' },
  assignedJudgeName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  photo: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATED'],
    default: 'PENDING'
  },
  criterionScores: {
    'crit-tech': { type: Number, default: null },
    'crit-innov': { type: Number, default: null },
    'crit-design': { type: Number, default: null },
    'crit-demo': { type: Number, default: null },
    'crit-doc': { type: Number, default: null }
  },
  finalScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  award: {
    type: String,
    default: null
  },
  judgeRemarks: {
    type: String,
    default: ''
  },
  evaluatedByJudgeId: {
    type: String,
    default: null
  },
  evaluatedByJudgeName: {
    type: String,
    default: null
  },
  submissionTimestamp: {
    type: String,
    default: null
  },
  isScoreLocked: {
    type: Boolean,
    default: false
  },
  oneTimeEditAllowed: {
    type: Boolean,
    default: false
  },
  scoreEditRequest: {
    id: { type: String, default: null },
    status: {
      type: String,
      enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'NONE'
    },
    requestedByJudgeId: { type: String, default: null },
    requestedByJudgeName: { type: String, default: null },
    reason: { type: String, default: '' },
    requestedAt: { type: String, default: null },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: String, default: null },
    reviewRemarks: { type: String, default: '' }
  },
  tieBreakNotice: {
    active: { type: Boolean, default: false },
    targetJudgeId: { type: String, default: null },
    targetJudgeName: { type: String, default: null },
    tiedScore: { type: Number, default: null },
    adminMessage: { type: String, default: '' },
    notifiedAt: { type: String, default: null },
    notifiedBy: { type: String, default: 'Administration' },
    categoryNumber: { type: Number, default: null }
  }
}, {
  timestamps: true
});

export const Team = mongoose.model('Team', TeamSchema);
export default Team;
