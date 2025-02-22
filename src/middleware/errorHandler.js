export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'An unexpected error occurred' : err.message;

    res.status(500).json({
        error: 'Server Error',
        message
    });
};