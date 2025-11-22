const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with your API key (from environment)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /generate-sprite
 * Request body: { "prompt": "A blue dragon with wings", "size": "512x512" }
 * Response: { "spriteUrl": "<image url>" }
 */
router.post('/generate-sprite', async (req, res) => {
    const { prompt, size } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Call OpenAI image generation API with response_format as 'url'
        const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
    quality: "high",        // makes edges sharpe
   
});

        const imageUrl = response.data[0].url;

        return res.json({
            url: imageUrl,
            format: 'png'
        });
    } catch (error) {
        console.error('Error generating sprite:', error);

        // Handle OpenAI billing errors gracefully
        if (error.code === 'billing_hard_limit_reached' || error?.response?.data?.code === 'billing_hard_limit_reached') {
            return res.status(402).json({ error: 'Billing limit reached on OpenAI. Please try again later or contact the system administrator.' });
        }
        return res.status(500).json({ error: 'Failed to generate sprite' });
    }
});

module.exports = router;
