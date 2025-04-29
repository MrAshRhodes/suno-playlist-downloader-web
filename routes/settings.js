import express from 'express';

const router = express.Router();

// Default settings
const defaultSettings = {
  name_templates: "{trackno} - {name}",
  overwrite_files: "false",
  embed_images: "true",
};

/**
 * @route GET /api/settings
 * @description Get user settings from session
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    // Initialize settings if they don't exist
    if (!req.session.settings) {
      req.session.settings = { ...defaultSettings };
    }
    
    res.json(req.session.settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

/**
 * @route POST /api/settings
 * @description Update user settings
 * @access Public
 */
router.post('/', (req, res) => {
  try {
    const { name_templates, overwrite_files, embed_images } = req.body;
    
    // Initialize settings if they don't exist
    if (!req.session.settings) {
      req.session.settings = { ...defaultSettings };
    }
    
    // Update settings with provided values
    if (name_templates !== undefined) {
      req.session.settings.name_templates = name_templates;
    }
    
    if (overwrite_files !== undefined) {
      req.session.settings.overwrite_files = overwrite_files;
    }
    
    if (embed_images !== undefined) {
      req.session.settings.embed_images = embed_images;
    }
    
    res.json(req.session.settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * @route DELETE /api/settings
 * @description Reset settings to defaults
 * @access Public
 */
router.delete('/', (req, res) => {
  try {
    // Reset to defaults
    req.session.settings = { ...defaultSettings };
    res.json(req.session.settings);
  } catch (error) {
    console.error('Settings reset error:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

export default router;