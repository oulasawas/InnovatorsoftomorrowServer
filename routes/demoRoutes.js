const express = require('express');
const {
  getAllDemos,
  searchDemos,
  getDemoById,
  createDemo,
  updateDemo,
  deleteDemo
} = require('../controllers/demoController.js');
const authMiddleware = require('../middleware/authMiddleware');
const { teacherMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (no auth required)
router.get('/search', searchDemos);
router.get('/:id', getDemoById);
router.get('/', getAllDemos);

// Protected routes (require authentication + teacher/admin role)
router.post('/', authMiddleware, teacherMiddleware, createDemo);
router.put('/:id', authMiddleware, teacherMiddleware, updateDemo);
router.delete('/:id', authMiddleware, teacherMiddleware, deleteDemo);

module.exports = router;
