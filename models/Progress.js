import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  numberOfSections: { type: Number, required: true },
  completedSections: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 }
});

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);