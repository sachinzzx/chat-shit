const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const store = require('./models/store');

const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();

// Enable CORS
app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers (50MB for high-res base64 images)
app.use(express.json({ limit: config.maxPayloadSize }));
app.use(express.urlencoded({ extended: true, limit: config.maxPayloadSize }));

// Request Logging
try {
    const morgan = require('morgan');
    app.use(morgan('dev'));
} catch (err) {
    app.use((req, res, next) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
        next();
    });
}

// Static Files: serve uploaded media
app.use('/uploads', express.static(config.uploadDir));

// Root Endpoint: Interactive HTML Dashboard
app.get('/', (req, res) => {
    const dashboardPath = path.join(__dirname, 'views/dashboard.html');
    res.sendFile(dashboardPath);
});

// Health check endpoint (for Docker & Kubernetes probes)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        docker: Boolean(process.env.DOCKER_CONTAINER || fs_in_docker()),
    });
});

// Server Statistics endpoint
app.get('/api/stats', (req, res) => {
    res.json(store.getStats());
});

// App Routes (with auth middleware)
app.use(authMiddleware);
app.use('/conversation', conversationRoutes);
app.use('/message', messageRoutes);
app.use('/user', userRoutes);
app.use('/media', mediaRoutes);

// Helper function to detect docker
function fs_in_docker() {
    try {
        const fs = require('fs');
        return fs.existsSync('/.dockerenv');
    } catch {
        return false;
    }
}

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.method} ${req.url} does not exist on ChatShit API server`,
    });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
