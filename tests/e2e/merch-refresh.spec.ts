import { test, expect } from '@playwright/test'

test('choosing a catalog card selects that product in the order and focuses the order', async ({ page }) => {
  await page.goto('/merch')
  await page.locator('#repchess-merch-10').getByRole('button', { name: /Выбрать/ }).click()
  await expect(page.getByLabel('Товар', { exact: true })).toHaveValue('repchess-merch-10')
  await expect(page.getByRole('heading', { name: 'Твоя заявка', exact: true })).toBeFocused()
  await expect(page.locator('#merch-order')).toContainText('Красный')
})

test('copy prepares the selected product and total without claiming the order was sent', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }))
  await page.goto('/merch')
  await page.getByLabel('Товар', { exact: true }).selectOption('repchess-merch-09')
  await page.getByRole('button', { name: 'XL', exact: true }).click()
  await page.getByRole('button', { name: 'Увеличить количество', exact: true }).click()
  await page.getByRole('textbox', { name: 'Telegram или телефон', exact: true }).fill('@buyer')
  await page.getByRole('button', { name: 'Скопировать заявку', exact: true }).click()
  const clipboard = await page.evaluate(() => navigator.clipboard.readText())
  expect(clipboard).toContain('Артикул: repchess-merch-09')
  expect(clipboard).toContain('Цвет: Графит')
  expect(clipboard).toContain('Размер: XL')
  expect(clipboard).toContain('Количество: 2')
  expect(clipboard.replace(/[\s\u00a0]/g, '')).toContain('Итого:7000₽')
  expect(clipboard).toContain('Контакт: @buyer')
  await expect(page.locator('#merch-order [role="status"]')).toContainText('не отправлена')
  await page.getByRole('button', { name: 'L', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Скопировать заявку', exact: true })).toBeVisible()
  await expect(page.locator('#merch-order [role="status"]')).not.toContainText('скопирована')
})

test('a missing contact and a denied clipboard have recoverable errors', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Denied') } }, configurable: true })
  })
  await page.goto('/merch')
  await page.getByRole('button', { name: 'Скопировать заявку', exact: true }).click()
  await expect(page.locator('#merch-order').getByRole('alert')).toContainText('контакт')
  await expect(page.getByRole('textbox', { name: 'Telegram или телефон', exact: true })).toBeFocused()
  await page.getByRole('textbox', { name: 'Telegram или телефон', exact: true }).fill('@buyer')
  await page.getByRole('button', { name: 'Скопировать заявку', exact: true }).click()
  await expect(page.locator('#merch-order').getByRole('alert')).toContainText('Выдели текст')
  await expect(page.locator('#merch-order pre')).toContainText('Контакт: @buyer')
})

test('canceling the device share dialog does not report a sent order or an error', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', {
    value: async () => { throw new DOMException('Canceled', 'AbortError') }, configurable: true,
  }))
  await page.goto('/merch')
  await page.getByRole('textbox', { name: 'Telegram или телефон', exact: true }).fill('@buyer')
  await page.getByRole('button', { name: 'Поделиться заявкой', exact: true }).click()
  await expect(page.locator('#merch-order').getByRole('alert')).toHaveCount(0)
  await expect(page.locator('#merch-order [role="status"]')).toBeEmpty()
})

test('Telegram draft targets the confirmed organizer and preserves order parameters', async ({ page }) => {
  await page.goto('/merch')
  const initialLink = await page.getByRole('link', { name: 'Отправить в Telegram', exact: true }).getAttribute('href')
  const initialText = new URL(initialLink!).searchParams.get('text')
  expect(initialText).toContain('Артикул: repchess-merch-08')
  expect(initialText).toContain('Размер: M')
  expect(initialText).not.toContain('Контакт:')
  await page.getByLabel('Товар', { exact: true }).selectOption('repchess-merch-10')
  await page.getByRole('button', { name: 'S', exact: true }).click()
  await page.getByRole('button', { name: 'Увеличить количество', exact: true }).click()
  await page.getByRole('textbox', { name: 'Telegram или телефон', exact: true }).fill('@buyer & вопрос?')
  const link = await page.getByRole('link', { name: 'Отправить в Telegram', exact: true }).getAttribute('href')
  const url = new URL(link!)
  expect(url.hostname).toBe('t.me')
  expect(url.pathname).toBe('/cheslove')
  expect(url.searchParams.get('text')).toContain('Артикул: repchess-merch-10')
  expect(url.searchParams.get('text')).toContain('Цвет: Красный')
  expect(url.searchParams.get('text')).toContain('Размер: S')
  expect(url.searchParams.get('text')).toContain('Количество: 2')
  expect(url.searchParams.get('text')).toContain('Контакт: @buyer & вопрос?')
  await expect(page.locator('#merch-telegram-note')).toContainText('самостоятельно')
})

test('catalog keeps product URLs, readable photographs and a stable canonical', async ({ page }) => {
  await page.goto('/merch')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://repchesskrd.ru/merch')
  for (const id of ['08', '09', '10']) {
    const card = page.locator(`#repchess-merch-${id}`)
    await expect(card).toBeVisible()
    await expect(card.getByRole('img')).toHaveAttribute('src', `/merch/repchess-merch-${id}.jpg`)
    await expect(card.getByRole('button', { name: /Выбрать/ })).toBeVisible()
  }
})

test('structured product data keeps existing prices without promising unconfirmed stock', async ({ page }) => {
  await page.goto('/merch')
  const products = await page.locator('script[type="application/ld+json"]').evaluateAll(elements =>
    elements.flatMap(el => JSON.parse(el.textContent || '{}')['@graph'] || []).filter(item => item['@type'] === 'Product'),
  )
  expect(products).toHaveLength(3)
  for (const product of products) {
    expect(product.offers.price).toBe(3500)
    expect(product.offers.priceCurrency).toBe('RUB')
    expect(product.offers.url).toMatch(/^https:\/\/repchesskrd\.ru\/merch#repchess-merch-(08|09|10)$/)
    expect(product.offers.availability).toBeUndefined()
  }
})

test('merch stays readable and the order is reachable at mobile and desktop widths', async ({ page }, testInfo) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/merch')
    await page.evaluate(() => document.fonts.ready)
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      clipped: [...document.querySelectorAll<HTMLElement>('h1,h2,input,select,pre')].filter(el => el.offsetWidth > 0 && el.scrollWidth > el.clientWidth + 2).map(el => el.textContent),
    }))
    expect(layout.scroll, `page overflow at ${width}`).toBeLessThanOrEqual(layout.width)
    expect(layout.clipped, `content overflow at ${width}`).toEqual([])
    if (width === 375 || width === 1440) {
      await page.screenshot({
        path: testInfo.outputPath(`merch-refresh-${width === 375 ? 'mobile' : 'desktop'}.jpg`),
        type: 'jpeg', fullPage: true, quality: 88,
      })
    }
    await page.locator('#repchess-merch-09').getByRole('button', { name: /Выбрать/ }).click()
    await expect(page.getByRole('heading', { name: 'Твоя заявка', exact: true })).toBeInViewport()
  }
})
