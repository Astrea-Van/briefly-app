const { GoogleGenAI } = require('@google/genai');

// Force the client to use the stable v1 API version where gemini-2.5-flash lives
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY
});

module.exports = ai;