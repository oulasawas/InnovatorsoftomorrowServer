const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['mp4', 'sb3'],
    required: true
  },
  folder: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number
  },
  lastModified: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);
