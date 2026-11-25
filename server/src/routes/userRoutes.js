const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.get('/', controller.getUsers);
router.get('/profile', controller.getUserProfile);
router.get('/:id', controller.getUserProfile);
router.post('/', controller.createUser);

module.exports = router;
