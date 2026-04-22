const express = require('express');
const router = express.Router({ mergeParams: true });
const { generateAiSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, generateAiSummary);

module.exports = router;
