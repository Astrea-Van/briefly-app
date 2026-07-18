const ai = require('../config/gemini');
const fs = require('fs').promises;
const path = require('path');
const { saveHistory, getHistory } = require('../config/dbConfig');

const analyzeDocument = async (req, res) => {
    try {
        // 1. Guard against empty submissions
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: "No file entered. Please enter a file for analysis." 
            });
        }

        // 2. Enforce memory size limits (5MB structural boundary)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (req.file.size > MAX_SIZE) {
            return res.status(400).json({ 
                success: false, 
                error: "Memory limit exceeded, enter a compatible file." 
            });
        }

        // 3. Validate file types safely
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ 
                success: false, 
                error: "Incompatible type entered, enter a compatible file." 
            });
        }

        // 4. Session authorization guard
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, error: "Unauthorized. Please log in." });
        }

        // Prepare the asset payload structure for Gemini
        const filePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        // Standard prompt running on your verified flash instance
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [
                "Analyze this document comprehensively. Provide a summary, key takeaways, and recommended action items.",
                filePart
            ]
        });
        
        const analysisResult = response.text || "";
        const userId = req.session.userId;

        // Save entry into database using the generated analysis text string
        await saveHistory(userId, req.file.originalname, req.file.mimetype, analysisResult);

        return res.json({
            success: true,
            analysis: analysisResult, 
            file: {
                name: req.file.originalname,
                type: req.file.mimetype
            }
        });

    } catch (error) {
        console.error("Error in analyzeDocument controller:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

const getAnalysisHistory = async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, error: "Unauthorized." });
        }

        const userId = req.session.userId;
        const rows = await getHistory(userId);
        
        // Clean database map to securely align database fields to front-end keys
        const safeHistory = rows.map(row => ({
            id: row.id,
            filename: row.filename || row.originalname || row.file_name || "Document",
            mimetype: row.mimetype || row.file_type || "application/octet-stream",
            analysis: row.analysis || row.analysis_text || row.result || row.content || "",
            created_at: row.created_at || row.timestamp || new Date()
        }));

        return res.json({ success: true, data: safeHistory });
    } catch (error) {
        console.error("Error in getAnalysisHistory controller:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    analyzeDocument,
    getAnalysisHistory
};