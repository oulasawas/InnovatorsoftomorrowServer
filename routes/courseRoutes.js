const express = require('express');
const { getCourseById,getAllCourses, createCourse, addLessonToCourse, addSectionToLesson, updateCourseDetails, updateBlock, updateSection, updateLesson } = require('../controllers/courseController.js');

const router = express.Router();
router.get("/:title", getCourseById);
router.get('/', getAllCourses);
router.post('/', createCourse); // POST /api/courses
router.post('/:title/lessons', addLessonToCourse);
router.post('/:title/lessons/:lessonId/sections', addSectionToLesson);
// Update course title/description
router.patch("/:title", updateCourseDetails);

// Update a lesson title
router.patch("/:title/lessons/:lessonNumber", updateLesson);

// Update section title
router.patch("/:title/lessons/:lessonNumber/sections/:sectionNumber", updateSection);

// Update a specific block
router.patch("/:title/lessons/:lessonNumber/sections/:sectionNumber/blocks/:blockType", updateBlock);

module.exports = router
