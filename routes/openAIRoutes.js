const express = require('express');
const { teach, reviewer } = require('../controllers/openAiController');
const router = express.Router();

router.post('/teach', teach);
router.post('/review', reviewer)

module.exports = router;