// Helper middleware to standardize response format
const responseFormatter = (req, res, next) => {
    res.success = (message, data = null, statusCode = 200) => {
        return res.status(statusCode).json({
            status: 'success',
            message,
            data
        });
    };

    res.error = (message, statusCode = 500, errors = null) => {
        return res.status(statusCode).json({
            status: 'error',
            message,
            errors
        });
    };

    next();
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    
    // Default error status and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan internal pada server';
    
    return res.status(statusCode).json({
        status: 'error',
        message,
        errors: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = {
    responseFormatter,
    errorHandler
};
