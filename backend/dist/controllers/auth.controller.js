import { validateTelegramWebAppData, parseTelegramWebAppData } from '../services/telegram/validator.js';
import logger from '../utils/logger.js';
import { AppError, BadRequestError, UnauthorizedError } from '../utils/AppError.js';
export class AuthController {
    static getTelegramAuth(req, res) {
        try {
            const initData = req.header('X-Telegram-InitData') || '';
            if (!initData) {
                throw new BadRequestError('Missing Telegram initData');
            }
            const user = parseTelegramWebAppData(initData);
            if (!user) {
                throw new UnauthorizedError('Invalid Telegram Web App initData');
            }
            logger.info(`User authenticated via GET: ${user.id} (${user.username})`);
            return res.json({ success: true, data: user });
        }
        catch (error) {
            logger.error('GET Telegram auth error:', error);
            throw error;
        }
    }
    static postTelegramAuth(req, res) {
        try {
            const initData = req.body?.initData || '';
            if (!initData) {
                throw new BadRequestError('Missing initData in request body');
            }
            const isProd = process.env.NODE_ENV === 'production';
            const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
            if (isProd && !botToken) {
                throw new AppError('Bot token not configured', 500);
            }
            let user = null;
            if (isProd) {
                user = validateTelegramWebAppData(initData, botToken);
            }
            else {
                user = parseTelegramWebAppData(initData);
            }
            if (!user) {
                throw new UnauthorizedError('Invalid Telegram Web App initData');
            }
            logger.info(`User authenticated via POST: ${user.id} (${user.username})`);
            return res.json({ success: true, data: user });
        }
        catch (error) {
            logger.error('POST Telegram auth error:', error);
            throw error;
        }
    }
}
