const multer = require('multer');
const path = require('path');

// 1. Configuring where and how files are saved on the server
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporarily store uploaded files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Generate a unique file name using current timestamp + a random massive integer
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. What files are allowed (PDF, TXT, and common image formats)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type! Only PDFs, TXT files, and Images (PNG/JPEG) are allowed.'), false); // Reject
    }
};

// 3. Initialize Multer with configurations and a 10MB size limit
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

module.exports = upload;