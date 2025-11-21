const express = require('express');
const { 
  getMp4FromFolder, 
  getAllSb3Files, 
  saveMediaMetadata, 
  getAllMediaFromDb 
} = require('../controllers/mediaController.js');

const router = express.Router();

// Get all MP4 videos from a specific folder
router.get('/videos/:folder', getMp4FromFolder);

// Get all SB3 files
router.get('/sb3', getAllSb3Files);

// Save media metadata to MongoDB
router.post('/metadata', saveMediaMetadata);

// Get all media from MongoDB with optional filters
router.get('/db', getAllMediaFromDb);

module.exports = router;
