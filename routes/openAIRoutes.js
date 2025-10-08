const express = require('express');
const { codeSnippet, reviewer } = require('../controllers/openAiController');
const router = express.Router();

router.post('/getCode', codeSnippet);
router.post('/review', reviewer)

module.exports = router;