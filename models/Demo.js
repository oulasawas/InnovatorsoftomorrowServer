const mongoose = require('mongoose');

/**
 * VALID ENUM VALUES
 */
const validCategories = [
  'web',
  'game',
  'ai',
  'mobile',
  '3d',
  'blockchain',
  'creative',
  'algorithm',
  'desktop',
  'fintech',
  'iot',
  'education',
  'ar',
  'vr',
  'hardware',
  'computer-vision',
  'developer-tools',
  'productivity'
];

const validDifficulties = [
  'beginner',
  'intermediate',
  'advanced'
];

/**
 * Step Schema
 */
const stepSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  code: { type: String },
  language: { type: String },
  notes: { type: String }
}, { _id: false });

/**
 * Demo Schema
 */
const demoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  library: { type: String },
  category: {
    type: String,
    required: true,
    enum: validCategories
  },
  difficulty: {
    type: String,
    required: true,
    enum: validDifficulties
  },
  description: { type: String },
  technologies: [{ type: String }],
  icon: { type: String },
  estimatedTime: { type: String },
  steps: [stepSchema]
}, { timestamps: true });

module.exports = mongoose.model('Demo', demoSchema);
module.exports.validCategories = validCategories;
module.exports.validDifficulties = validDifficulties;
