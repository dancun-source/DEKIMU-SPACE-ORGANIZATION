const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const { stkPush } = require('../utils/daraja');

// @desc    Initiate M-Pesa Payment
// @route   POST /api/payment/stk
// @access  Private
const mongoose = require('mongoose');

// @desc    Initiate M-Pesa Payment
// @route   POST /api/payment/stk
// @access  Private
const initiatePayment = async (req, res) => {
    const { courseId, phoneNumber } = req.body;
    const userId = req.user.id;

    let course;
    if (mongoose.Types.ObjectId.isValid(courseId)) {
        course = await Course.findById(courseId);
    } else {
        // Map frontend IDs to Titles
        const titleMap = {
            'public-speaking': 'Public Speaking',
            'leadership': 'Leadership Excellence',
            'mental-health': 'Mental Health',
            'academic-excellence': 'Academic Excellence'
        };
        const title = titleMap[courseId];

        if (title) {
            course = await Course.findOne({ title: new RegExp(`^${title}$`, 'i') });

            // Auto-create if not found (for testing/demo)
            if (!course) {
                course = await Course.create({
                    title: title,
                    description: `Comprehensive training in ${title}`,
                    price: 1500,
                    isPublished: true
                });
            }
        }
    }

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    try {
        // Format phone number (must start with 254)
        let formattedPhone = phoneNumber;
        if (phoneNumber.startsWith('0')) {
            formattedPhone = '254' + phoneNumber.slice(1);
        }

        const response = await stkPush(formattedPhone, course.price, `Course-${courseId}`);

        // Create payment record
        await Payment.create({
            user: userId,
            course: courseId,
            amount: course.price,
            phoneNumber: formattedPhone,
            checkoutRequestID: response.CheckoutRequestID,
            merchantRequestID: response.MerchantRequestID,
            status: 'PENDING'
        });

        res.status(200).json({ message: 'STK Push initiated', checkoutRequestID: response.CheckoutRequestID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Payment initiation failed' });
    }
};

// @desc    M-Pesa Callback
// @route   POST /api/payment/callback
// @access  Public
const mpesaCallback = async (req, res) => {
    try {
        const { Body } = req.body;
        const { stkCallback } = Body;
        const { MerchantRequestID, CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

        const payment = await Payment.findOne({ checkoutRequestID: CheckoutRequestID });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (ResultCode === 0) {
            // Success
            payment.status = 'COMPLETED';

            // Extract Receipt Number
            const receiptItem = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
            if (receiptItem) {
                payment.mpesaReceiptNumber = receiptItem.Value;
            }

            await payment.save();

            // Unlock course for user
            const user = await User.findById(payment.user);
            if (user) {
                if (!user.purchasedCourses.includes(payment.course)) {
                    user.purchasedCourses.push(payment.course);
                    await user.save();
                }
            }
        } else {
            // Failed
            payment.status = 'FAILED';
            await payment.save();
        }

        res.status(200).json({ message: 'Callback received' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Callback processing failed' });
    }
};

module.exports = { initiatePayment, mpesaCallback };
