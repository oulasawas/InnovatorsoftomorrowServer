const express = require('express');
const { enrollCourse, completeSection, updateTeacherFlag, getUserProfile,getSingleEnrolledCourse } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/enroll', enrollCourse);
router.post('/complete', completeSection);
// Get user profile
//router.get("/profile/:userId", getUserProfile);
router.patch('/:userId/enrolled/:courseTitle/complete', completeSection)
router.get("/:userId/profile", getUserProfile);
// Set teacher status
router.get("/:userId/enrolled/:courseTitle", getSingleEnrolledCourse);
router.patch("/:userId/teacher", updateTeacherFlag);
module.exports = router;