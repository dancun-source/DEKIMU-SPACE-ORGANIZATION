const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// @desc    Get secure content
// @route   GET /api/content/:courseId/:filename
// @access  Private
const getContent = async (req, res) => {
    const { courseId, filename } = req.params;

    // Check if user purchased the course
    const user = await User.findById(req.user.id);

    // Admin can access everything
    if (user.role !== 'admin' && !user.purchasedCourses.includes(courseId)) {
        return res.status(403).json({ message: 'Not authorized to access this content' });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
};

module.exports = { getContent };
