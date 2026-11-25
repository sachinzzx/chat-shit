const fs = require('fs');
const path = require('path');
const config = require('../config');

exports.uploadImage = (req, res) => {
    try {
        // If uploaded via Multer multipart
        if (req.file) {
            const host = req.get('host');
            const protocol = req.protocol;
            const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
            return res.status(201).json({
                success: true,
                filename: req.file.filename,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype,
            });
        }

        // If uploaded via Base64 JSON body
        const { base64Data, filename } = req.body;
        if (!base64Data) {
            return res.status(400).json({ error: 'No file or base64Data provided' });
        }

        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        const targetName = filename || `img_${Date.now()}.jpg`;
        const filePath = path.join(config.uploadDir, targetName);

        fs.writeFileSync(filePath, buffer);

        const host = req.get('host');
        const protocol = req.protocol;
        const fileUrl = `${protocol}://${host}/uploads/${targetName}`;

        res.status(201).json({
            success: true,
            filename: targetName,
            url: fileUrl,
            size: buffer.length,
        });
    } catch (err) {
        res.status(500).json({ error: 'Image upload failed', message: err.message });
    }
};
