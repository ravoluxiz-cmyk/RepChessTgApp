export function parseTelegramWebAppData(initData) {
    try {
        const url = new URLSearchParams(initData);
        const userStr = url.get('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    catch {
        return null;
    }
}
export function validateTelegramWebAppData(initData, _botToken) {
    return parseTelegramWebAppData(initData);
}
