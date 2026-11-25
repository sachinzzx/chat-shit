const http = require('http');
const app = require('./src/app');
const config = require('./src/config');
const initSocket = require('./src/sockets/chatSocket');

// Create standard HTTP server
const server = http.createServer(app);

// Initialize Real-time Socket.IO
initSocket(server, app);

// Start listening on 0.0.0.0 (required for Docker containers and mobile devices)
server.listen(config.port, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⚡ ChatShit Backend Server v2.0 is LIVE!`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🌐 LAN/Docker URL: http://0.0.0.0:${config.port}`);
    console.log(`💬 Socket.IO Realtime: Enabled`);
    console.log(`💾 Persistent Database: ${config.dataDir}/db.json`);
    console.log(`📁 Media Uploads: ${config.uploadDir}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
