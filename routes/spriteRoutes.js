const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /generate-sprite
 * Request body: { "prompt": "A blue dragon with wings", "size": "512x512" }
 * Response: { "sprite": "<base64 PNG image>" }
 */
router.post('/generate-sprite', async (req, res) => {
    const { prompt, size } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Call OpenAI image generation API
        const response = await openai.images.generate({
            prompt,
            n: 1,
            size: size,
            response_format: "b64_json"
        });

        const base64Image = response.data[0].b64_json;

        return res.json({
            sprite: base64Image,
            format: 'png'
        });
    } catch (error) {
        console.error('Error generating sprite:', error);
        return res.status(500).json({ error: 'Failed to generate sprite' });
    }
});

module.exports = router;
