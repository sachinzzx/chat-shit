const express = require('express');
const router = express.Router();
const controller = require('../controllers/conversationController');

router.get('/', controller.getConversations);
router.post('/', controller.createConversation);
router.get('/:id', controller.getConversationById);

module.exports = router;
