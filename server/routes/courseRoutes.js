const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, getMyCourses } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/mycourses', protect, getMyCourses);
router.route('/').get(getCourses).post(protect, createCourse);
router.route('/:id').get(getCourse).put(protect, updateCourse);

module.exports = router;
