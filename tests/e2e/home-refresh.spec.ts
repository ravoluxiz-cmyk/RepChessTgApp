import { test, expect } from '@playwright/test'

test('homepage prioritizes the app and Telegram and exposes crawlable content', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Шахматы в Краснодаре/)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText('ШАХМАТЫ — ЭТО ЛЮДИ.')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/repchesskrd\.ru\/?$/)
  const hero = page.locator('section[aria-labelledby="home-title"]')
  await expect(hero.getByRole('link', { name: 'Скачать приложение', exact: true })).toHaveAttribute('href', '#app')
  await expect(hero.getByRole('link', { name: 'Войти в Telegram', exact: true })).toHaveAttribute('href', 'https://t.me/RepChessKRD')
  await expect(page.locator('#community')).toContainText('930+')
  expect(await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.map(element => JSON.parse(element.textContent || '{}')))).toEqual(expect.arrayContaining([expect.objectContaining({ '@graph': expect.arrayContaining([expect.objectContaining({ '@type': 'MobileApplication' }), expect.objectContaining({ '@type': 'FAQPage' })]) })]))
})

test('app screens and FAQ are interactive and store links are real', async ({ page }) => {
  await page.goto('/')
  const app = page.locator('#app')
  await app.getByRole('button', { name: 'Рейтинг', exact: true }).click()
  await expect(app.getByAltText('Экран рейтинга и лиг в приложении Rep Chess')).toBeVisible()
  await app.getByRole('button', { name: 'Часы', exact: true }).click()
  await expect(app.getByAltText('Встроенные шахматные часы в приложении Rep Chess')).toBeVisible()
  await expect(app.getByRole('link', { name: /App Store/ })).toHaveAttribute('href', 'https://apps.apple.com/app/id6776794104')
  await expect(app.getByRole('link', { name: /Google Play/ })).toHaveAttribute('href', 'https://play.google.com/store/apps/details?id=ru.nfg.repchess')
  await page.locator('summary').filter({ hasText: 'Можно прийти, если я новичок?' }).click()
  await expect(page.locator('details[open]')).toHaveCount(1)
})

test('mobile menu and layouts from 320 to 1440 pixels do not overflow', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, clipped: [...document.querySelectorAll<HTMLElement>('h1,h2,h3,#app a,#app button')].filter(element => element.offsetWidth > 0 && element.scrollWidth > element.clientWidth + 2).map(element => element.textContent) }))
    expect(layout.scroll, `page overflow at ${width}px`).toBeLessThanOrEqual(layout.width)
    expect(layout.clipped, `text overflow at ${width}px`).toEqual([])
  }
  await page.setViewportSize({ width: 390, height: 900 })
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click()
  await page.getByRole('navigation', { name: 'Мобильная навигация' }).getByRole('link', { name: 'Скачать приложение' }).click()
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toHaveCount(0)
  await expect(page).toHaveURL(/#app$/)
})
