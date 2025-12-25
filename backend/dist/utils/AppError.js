export class AppError extends Error {
    constructor(message, statusCode = 500, data) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', data) {
        super(message, 400, data);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', data) {
        super(message, 401, data);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', data) {
        super(message, 403, data);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Not Found', data) {
        super(message, 404, data);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Conflict', data) {
        super(message, 409, data);
    }
}
