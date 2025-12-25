import { AppError } from '../utils/AppError.js';
export const errorHandler = (error, req, res, next) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(error.data && { data: error.data }),
        });
    }
    console.error('Unhandled error:', error);
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            message: error.message
        }),
    });
};
