import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { telegramAuthSchema } from '../schemas/auth.schema.js';
export const router = Router();
router.get('/telegram', AuthController.getTelegramAuth);
router.post('/telegram', validate(telegramAuthSchema), AuthController.postTelegramAuth);
