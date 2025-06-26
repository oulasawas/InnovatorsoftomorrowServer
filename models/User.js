const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const progressSchema = new mongoose.Schema({
  courseId: String,
  numberOfSections: Number,
  completedSections: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  teacher: {
    type: Boolean,
    default: false
  },
  enrolledCourses: [
    {
      title: String,
      numberOfSections: Number,
      completedSections: Number,
      progressPercentage: Number
    }
  ],
  totalPoints: {
    type: Number,
    default: 0
  }
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);