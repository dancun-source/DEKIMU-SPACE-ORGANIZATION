const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    thumbnail: {
        type: String, // Path to image
        default: 'default-course.jpg'
    },
    content: [{
        title: String,
        type: { type: String, enum: ['video', 'pdf', 'link', 'live'] },
        url: String, // Path to file or external link
        isFree: { type: Boolean, default: false }
    }],
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
