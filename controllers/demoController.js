const axios = require('axios');
// controllers/demoController.js
const Demo = require('../models/Demo.js');

/**
 * Get all demos (WITHOUT steps for performance)
 * Query params: ?category=web (optional)
 */
exports.getAllDemos = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    const demos = await Demo.find(filter).select('-steps');
    res.status(200).json({ demos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Search demos by name, description, library, or technologies
 * Query params: ?q=weather
 */
exports.searchDemos = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    const regex = { $regex: q, $options: 'i' };
    const demos = await Demo.find({
      $or: [
        { name: regex },
        { description: regex },
        { library: regex },
        { technologies: regex }
      ]
    }).select('-steps');
    res.status(200).json({ demos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single demo by ID (WITH all steps)
 */
exports.getDemoById = async (req, res) => {
  try {
    const demo = await Demo.findOne({ id: parseInt(req.params.id, 10) });
    if (!demo) {
      return res.status(404).json({ error: 'Demo not found' });
    }
    res.status(200).json({ demo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create new demo (requires authentication + teacher/admin role)
 */
exports.createDemo = async (req, res) => {
  try {
    const { id, name, library, category, difficulty, description, technologies, icon, estimatedTime, steps } = req.body;

    // Validate required fields
    if (!id || !name || !category || !difficulty) {
      return res.status(400).json({ error: 'id, name, category, and difficulty are required' });
    }

    // Validate steps array has at least 1 step
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: 'At least one step is required' });
    }

    // Check if demo with this ID already exists
    const existing = await Demo.findOne({ id });
    if (existing) {
      return res.status(409).json({ error: 'Demo with this ID already exists' });
    }

    const newDemo = new Demo({
      id,
      name,
      library,
      category,
      difficulty,
      description,
      technologies,
      icon,
      estimatedTime,
      steps
    });

    await newDemo.save();
    res.status(201).json({ demo: newDemo, message: 'Demo created successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update existing demo (requires authentication + teacher/admin role)
 */
exports.updateDemo = async (req, res) => {
  try {
    const demoId = parseInt(req.params.id, 10);
    const updates = req.body;

    // Validate steps if provided
    if (updates.steps && (!Array.isArray(updates.steps) || updates.steps.length === 0)) {
      return res.status(400).json({ error: 'Steps array must have at least one step' });
    }

    const demo = await Demo.findOneAndUpdate(
      { id: demoId },
      updates,
      { new: true, runValidators: true }
    );

    if (!demo) {
      return res.status(404).json({ error: 'Demo not found' });
    }

    res.status(200).json({ demo, message: 'Demo updated successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete demo (requires authentication + teacher/admin role)
 */
exports.deleteDemo = async (req, res) => {
  try {
    const demoId = parseInt(req.params.id, 10);
    const demo = await Demo.findOneAndDelete({ id: demoId });

    if (!demo) {
      return res.status(404).json({ error: 'Demo not found' });
    }

    res.status(200).json({ message: 'Demo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const { demoId, prompt } = req.body;
    if (typeof demoId !== 'number') {
      return res.status(400).json({ error: 'demoId must be a number' });
    }
    const userPrompt =
      prompt ||
      `Create a programming demo for ID ${demoId}. The demo should contain a name, library, category, difficulty (beginner/intermediate/advanced), description (2-3 sentences), technologies (list), icon (emoji), estimatedTime, and 10 steps. Each step includes number (1-10), title, detailed description, working code, and tips. Output valid JSON.`; 

    // Choose API
    let apiKey, apiUrl, headers, data;
    if (process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY;
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      data = {
        model: 'gpt-4', // or most recent available
        messages: [
          { role: 'system', content: 'Your response MUST be valid JSON and JSON only — do NOT include explanations, notes, markdown code fences, or any extra text. Respond ONLY with the JSON object itself.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000
      };
    } else if (process.env.ANTHROPIC_API_KEY) {
      apiKey = process.env.ANTHROPIC_API_KEY;
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers = {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      };
      data = {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        temperature: 0.8,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      };
    } else {
      return res.status(500).json({ error: 'No API key configured' });
    }

    // Call AI API
    const aiRes = await axios.post(apiUrl, data, { headers });
    let aiText;
    if (aiRes.data.choices) {
      aiText = aiRes.data.choices[0].message?.content;
    } else if (aiRes.data.content) {
      aiText = aiRes.data.content;
    } else if (aiRes.data.messages) {
      aiText = aiRes.data.messages[0]?.content;
    }

    // Parse to JSON
    let demoObj;
    try {
      demoObj = JSON.parse(aiText);
    } catch (e) {
      console.log(e)
      return res.status(502).json({ error: 'AI response was not valid JSON', raw: aiText });
    }

    // (optional) Validate Demo schema fields here

    return res.json(demoObj);
  } catch (err) {
    console.error('AI demo generation error:', err);
    if (err.response) {
      console.log(err.response)
      return res.status(err.response.status || 502).json({ error: err.response.data || 'API Error' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}
