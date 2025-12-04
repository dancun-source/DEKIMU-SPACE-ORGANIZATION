const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    checkoutRequestID: {
        type: String,
        required: true,
        unique: true
    },
    merchantRequestID: {
        type: String,
        required: true
    },
    mpesaReceiptNumber: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
