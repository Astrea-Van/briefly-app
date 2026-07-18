const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Or your custom multerConfig import if you prefer

// Import functions matching the controller names exactly
const { analyzeDocument, getAnalysisHistory } = require('../controllers/analyzeController');

// Route configurations
router.post('/document', upload.single('file'), analyzeDocument);
router.get('/history', getAnalysisHistory);

module.exports = router;