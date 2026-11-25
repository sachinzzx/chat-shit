const express = require('express');
const router = express.Router();
const controller = require('../controllers/messageController');

router.get('/', controller.getMessages);
router.post('/', controller.sendMessage);

module.exports = router;
