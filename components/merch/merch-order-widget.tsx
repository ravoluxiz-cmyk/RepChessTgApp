"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import styles from "./merch.module.css"

export type OrderProduct = {
  id: string
  name: string
  price: number
  image: string
  colors: string[]
  shortDescription: string
  fit: string
}

const sizes = ["S", "M", "L", "XL"]

type OrderProps = {
  products: OrderProduct[]
  productId: string
  onSelectProduct: (id: string) => void
  headingRef: RefObject<HTMLHeadingElement | null>
}

export default function MerchOrderWidget({ products, productId, onSelectProduct, headingRef }: OrderProps) {
  const [canShare, setCanShare] = useState(false)
  const [size, setSize] = useState("M")
  const [quantity, setQuantity] = useState(1)
  const [contact, setContact] = useState("")
  const [copiedText, setCopiedText] = useState("")
  const [sharedText, setSharedText] = useState("")
  const [error, setError] = useState<{ text: string; draft: string } | null>(null)
  const [pending, setPending] = useState(false)
  const contactInput = useRef<HTMLInputElement>(null)
  const product = products.find(item => item.id === productId) || products[0]

  useEffect(() => setCanShare(typeof navigator.share === "function"), [])

  if (!product) return null

  const total = product.price * quantity
  const orderText = [
    "Заказ REP CHESS KRD",
    `Товар: ${product.name}`,
    `Артикул: ${product.id}`,
    `Цвет: ${product.colors[0]}`,
    `Размер: ${size}`,
    `Количество: ${quantity}`,
    `Итого: ${total.toLocaleString("ru-RU")} ₽`,
    contact.trim() ? `Контакт: ${contact.trim()}` : null,
  ].filter(Boolean).join("\n")
  const copied = copiedText === orderText
  const currentError = error?.draft === orderText ? error.text : null

  const prepareOrder = async (action: "copy" | "share") => {
    setCopiedText("")
    setSharedText("")
    setError(null)
    if (!contact.trim()) {
      setError({ text: "Добавь контакт: Telegram или телефон, чтобы можно было ответить по заказу.", draft: orderText })
      contactInput.current?.focus()
      return
    }
    setPending(true)
    try {
      if (action === "share" && navigator.share) {
        await navigator.share({ title: "Заказ REP CHESS KRD", text: orderText })
        setSharedText(orderText)
      } else {
        await navigator.clipboard.writeText(orderText)
        setCopiedText(orderText)
      }
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) {
        setError({ text: "Не удалось подготовить заявку. Выдели текст ниже, скопируй вручную и отправь организатору.", draft: orderText })
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <aside id="merch-order" className={styles.order} aria-labelledby="merch-order-title">
      <h2 id="merch-order-title" ref={headingRef} tabIndex={-1} className="brand-title">Твоя заявка</h2>
      <p className={styles.orderIntro}>Выбери параметры — текст заказа откроется в переписке с @cheslove. Сайт не отправляет его автоматически.</p>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="merch-product">Товар</label>
          <select id="merch-product" value={product.id} onChange={event => onSelectProduct(event.target.value)}>
            {products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <p className={styles.color}>Цвет: <span>{product.colors.join(" / ")}</span></p>
        <fieldset className={styles.fieldset}>
          <legend>Размер</legend>
          <div className={styles.sizeOptions}>
            {sizes.map(item => <button key={item} type="button" aria-pressed={size === item} onClick={() => setSize(item)}>{item}</button>)}
          </div>
        </fieldset>
        <div className={styles.quantityRow}>
          <span>Количество</span>
          <div className={styles.quantity}>
            <button type="button" aria-label="Уменьшить количество" disabled={quantity === 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}>−</button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" aria-label="Увеличить количество" disabled={quantity === 9} onClick={() => setQuantity(value => Math.min(9, value + 1))}>+</button>
          </div>
        </div>
        <label className={styles.field} htmlFor="merch-contact">
          <span>Telegram или телефон</span>
          <input id="merch-contact" ref={contactInput} value={contact} onChange={event => setContact(event.target.value)} placeholder="@username или номер телефона" aria-invalid={Boolean(currentError && !contact.trim())} aria-describedby={currentError ? "merch-contact-note merch-order-error" : "merch-contact-note"} />
        </label>
        <p id="merch-contact-note" className={styles.contactNote}>При отправке через Telegram контакт можно не указывать.</p>
      </div>
      <div className={styles.total}><span>Итого</span><strong>{total.toLocaleString("ru-RU")} ₽</strong></div>
      <a className={styles.copy} href={`https://t.me/cheslove?text=${encodeURIComponent(orderText)}`} target="_blank" rel="noopener noreferrer" aria-describedby="merch-telegram-note">Отправить в Telegram<span aria-hidden="true">↗</span></a>
      <p id="merch-telegram-note" className={styles.contactNote}>Откроется черновик у @cheslove. Отправь сообщение в Telegram самостоятельно.</p>
      <button type="button" className={styles.share} disabled={pending} onClick={() => prepareOrder("copy")}>{copied ? "Заявка скопирована" : "Скопировать заявку"}</button>
      {canShare ? <button type="button" className={styles.share} disabled={pending} onClick={() => prepareOrder("share")}>Поделиться заявкой</button> : null}
      <p className={styles.status} role="status" aria-live="polite">{copied ? "Заявка скопирована, но ещё не отправлена. Вставь её в переписку с организатором и отправь." : sharedText === orderText ? "Текст передан в меню «Поделиться». Отправь его организатору — сайт не подтверждает получение заказа." : ""}</p>
      {currentError ? <p id="merch-order-error" className={styles.error} role="alert">{currentError}</p> : null}
      <details className={styles.draft} open={Boolean(currentError)}>
        <summary>Текст заявки</summary>
        <pre>{orderText}</pre>
      </details>
    </aside>
  )
}
