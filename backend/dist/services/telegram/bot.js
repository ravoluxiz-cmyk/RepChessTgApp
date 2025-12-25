import TelegramBot from 'node-telegram-bot-api';
const token = process.env.TELEGRAM_BOT_TOKEN || '';
export function startBot() {
    if (!token)
        return;
    const bot = new TelegramBot(token, { polling: true });
    bot.on('message', (msg) => {
        const text = msg.text || '';
        if (text.toLowerCase() === '/start') {
            bot.sendMessage(msg.chat.id, 'Бот запущен');
        }
    });
}
