import express from 'express';
import { enrollCourse, completeSection } from '../controllers/progressController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/enroll', authMiddleware, enrollCourse);
router.post('/complete', authMiddleware, completeSection);

export default router;