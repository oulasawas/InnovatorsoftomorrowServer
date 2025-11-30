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
