const path = require('path');

const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '50mb',
    
    // File Storage Paths
    dataDir: path.resolve(process.env.DATA_DIR || path.join(__dirname, '../../data')),
    uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')),
    
    // Basic Auth
    auth: {
        user: process.env.BASIC_AUTH_USER || 'first',
        pass: process.env.BASIC_AUTH_PASS || 'second',
    },
};

module.exports = config;
