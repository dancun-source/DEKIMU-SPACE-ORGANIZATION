const express = require('express');
const router = express.Router();
const { getContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId/:filename', protect, getContent);

module.exports = router;
