const { processAssistantMessage } = require('../services/assistantService');

exports.handleAssistantMessage = async (req, res) => {
  try {
    const { message, draftRequest } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide a valid message string.' });
    }

    const response = await processAssistantMessage({
      message,
      draftRequest: draftRequest || null,
      user: req.user || null,
    });

    res.json({
      success: true,
      ...response,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
