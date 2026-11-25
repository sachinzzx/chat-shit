const express = require('express');
const router = express.Router();
const controller = require('../controllers/mediaController');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('file'), controller.uploadImage);

module.exports = router;
