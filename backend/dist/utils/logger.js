import winston from 'winston';
const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: { service: 'telegram-game-backend' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
});
if (nodeEnv === 'production') {
    logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
    logger.add(new winston.transports.File({ filename: 'combined.log' }));
}
export default logger;
