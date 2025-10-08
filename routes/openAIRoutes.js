const express = require('express');
const { teach } = require('../controllers/openAiController');
const router = express.Router();

router.post('/teach', teach);


module.exports = router;