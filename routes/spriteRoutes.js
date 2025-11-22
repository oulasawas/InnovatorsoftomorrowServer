// Sprite generation controller using OpenAI image API
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// Make sure to provide OPENAI_API_KEY in your environment
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
}));

/**
 * POST /generate-sprite
 * Request body: { "prompt": "A blue dragon with wings" }
 * Response: { "sprite": "<base64 PNG image>" }
 */
router.post('/generate-sprite', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Call OpenAI image generation API - DALL-E 3 endpoint
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: "512x512", // You may adjust size for your needs!
            response_format: "b64_json" // Request base64-encoded response
        });

        // Get base64 image string
        const base64Image = response.data.data[0].b64_json;

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
