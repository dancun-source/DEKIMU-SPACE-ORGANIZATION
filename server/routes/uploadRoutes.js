const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// No file type restrictions - upload anything you want
// But limit file size to 50MB for safety
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    }
});

router.post('/', protect, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Any authenticated user can upload; admin-only actions are still enforced elsewhere
        // Return path relative to public folder (uploads/filename.jpg)
        const relativePath = `/uploads/${req.file.filename}`;
        res.json({ success: true, path: relativePath });
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
        }
        console.error('Upload error:', error);
        res.status(500).json({ 
            message: 'Upload failed', 
            error: process.env.NODE_ENV === 'production' ? undefined : error.message 
        });
    }
});

module.exports = router;
