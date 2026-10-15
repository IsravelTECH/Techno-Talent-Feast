import mongoose from 'mongoose';

const CategoryQuotaSchema = new mongoose.Schema({
  categoryNumber: { type: Number, required: true },
  categoryName: { type: String, required: true },
  required: { type: Number, default: 2 },
  selected: { type: Number, default: 0 },
  status: { type: String, enum: ['COMPLETE', 'PENDING'], default: 'PENDING' }
}, { _id: false });

const SchoolSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'UAE'
  },
  state: {
    type: String,
    default: 'Dubai'
  },
  principalName: {
    type: String,
    default: ''
  },
  coordinatorName: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  totalRegistered: {
    type: Number,
    default: 0
  },
  totalFinalists: {
    type: Number,
    default: 0
  },
  isQuotaConfirmed: {
    type: Boolean,
    default: false
  },
  categoryQuotas: [CategoryQuotaSchema],
  averageScore: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  goldMedals: {
    type: Number,
    default: 0
  },
  silverMedals: {
    type: Number,
    default: 0
  },
  bronzeMedals: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const School = mongoose.model('School', SchoolSchema);
export default School;
