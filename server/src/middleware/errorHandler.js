module.exports = function errorHandler(err, req, res, next) {
    console.error(`[Error] ${req.method} ${req.url}:`, err);

    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'Something went wrong on the server',
        timestamp: new Date().toISOString(),
    });
};
