const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    const courses = await Course.find({ isPublished: true });
    res.status(200).json(courses);
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public (but content locked)
// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public (but content locked)
const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check for authentication manually since this is a public route
        let user = null;
        let hasAccess = false;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id);

                if (user) {
                    // Check if admin or purchased
                    if (user.role === 'admin') {
                        hasAccess = true;
                    } else {
                        hasAccess = user.purchasedCourses.includes(course._id);
                    }
                }
            } catch (error) {
                // Token invalid or expired, treat as guest
                console.log('Token verification failed in getCourse:', error.message);
            }
        }

        // If no access, strip URLs from non-free content
        if (!hasAccess) {
            const secureContent = course.content.map(item => {
                if (item.isFree) return item;
                // Return item without URL
                return {
                    _id: item._id,
                    title: item.title,
                    type: item.type,
                    isFree: item.isFree,
                    // url is omitted
                };
            });

            // Clone course to avoid modifying the mongoose document directly if not needed, 
            // or just return a new object.
            const secureCourse = {
                ...course.toObject(),
                content: secureContent
            };
            return res.status(200).json(secureCourse);
        }

        // Full access
        res.status(200).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const course = await Course.create(req.body);
    res.status(201).json(course);
};

// @desc    Get user's purchased courses
// @route   GET /api/courses/mycourses
// @access  Private
const getMyCourses = async (req, res) => {
    const user = await User.findById(req.user.id).populate('purchasedCourses');
    res.status(200).json(user.purchasedCourses);
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
};

module.exports = {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    getMyCourses
};
