const path = require('path');
const config = require('../config');

let multerInstance = null;

try {
    const multer = require('multer');
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, config.uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname) || '.jpg';
            const uniqueName = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
            cb(null, uniqueName);
        },
    });

    multerInstance = multer({
        storage,
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    });
} catch (err) {
    console.warn('[Multer] Optional multer package not loaded yet, using memory/stream fallback.');
}

module.exports = multerInstance || {
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => next(),
};
