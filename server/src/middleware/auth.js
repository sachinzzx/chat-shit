const config = require('../config');

module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    // In dev mode or health check, allow without blocking
    if (!authHeader) {
        return next();
    }

    try {
        if (authHeader.startsWith('Basic ')) {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const [username, password] = credentials.split(':');

            // Attach user metadata to request
            req.authUser = { username };
            return next();
        }
    } catch (err) {
        console.warn('[Auth] Error parsing authorization header:', err.message);
    }

    next();
};
