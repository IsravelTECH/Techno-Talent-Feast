import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  projectNumber: { type: Number, required: true },
  title: { type: String, required: true },
  categoryNumber: { type: Number, required: true },
  categoryName: { type: String, required: true },
  gradeEligibility: { type: String, default: '' },
  objective: { type: String, default: '' },
  specification: { type: String, default: '' },
  description: { type: String, default: '' },
  softwareOrTools: [{ type: String }],
  tasks: [{ type: String }],
  submissionRequirements: [{ type: String }]
}, {
  timestamps: true
});

export const Project = mongoose.model('Project', projectSchema);
