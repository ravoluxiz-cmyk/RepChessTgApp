import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as authRouter } from './routes/auth.js';
import { startBot } from './services/telegram/bot.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'backend', ts: new Date().toISOString() });
});
app.use('/api/auth', authRouter);
// Error handling middleware (must be last)
app.use(errorHandler);
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
startBot();
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
