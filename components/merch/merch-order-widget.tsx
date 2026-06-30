"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Copy, Minus, Plus, Send } from "lucide-react"

type OrderProduct = {
  id: string
  name: string
  price: number
  image: string
  colors: string[]
}

const sizes = ["S", "M", "L", "XL"]

export default function MerchOrderWidget({ products }: { products: OrderProduct[] }) {
  const [canShare, setCanShare] = useState(false)
  const [productId, setProductId] = useState(products[0]?.id || "")
  const product = products.find((item) => item.id === productId) || products[0]
  const [size, setSize] = useState("M")
  const [color, setColor] = useState(product?.colors[0] || "")
  const [quantity, setQuantity] = useState(1)
  const [contact, setContact] = useState("")
  const [copied, setCopied] = useState(false)

  const orderText = useMemo(() => {
    if (!product) return ""

    const total = product.price * quantity
    return [
      "Заказ REP CHESS KRD",
      `Товар: ${product.name}`,
      `Артикул: ${product.id}`,
      `Цвет: ${color}`,
      `Размер: ${size}`,
      `Количество: ${quantity}`,
      `Итого: ${total.toLocaleString("ru-RU")} ₽`,
      contact ? `Контакт: ${contact}` : null,
    ].filter(Boolean).join("\n")
  }, [color, contact, product, quantity, size])

  useEffect(() => {
    setCanShare(Boolean(navigator.share))
  }, [])

  const selectProduct = (id: string) => {
    const next = products.find((item) => item.id === id)
    if (!next) return
    setProductId(id)
    setColor(next.colors[0] || "")
  }

  const shareOrder = async () => {
    setCopied(false)
    try {
      if (navigator.share) {
        await navigator.share({ title: "Заказ REP CHESS KRD", text: orderText })
        return
      }
      await navigator.clipboard.writeText(orderText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  if (!product) return null

  return (
    <aside className="brand-panel h-fit rounded-[18px] p-5 text-[#151515] lg:sticky lg:top-6">
      <h2 className="brand-title mb-4 text-3xl">Заказ</h2>

      <div className="space-y-5">
        <div>
          <div className="mb-2 text-sm font-semibold text-[#151515]/60">Товар</div>
          <select
            value={product.id}
            onChange={(event) => selectProduct(event.target.value)}
            className="w-full rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"
          >
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#151515]/10 bg-[#151515]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
        </div>

        <div>
          <div className="brand-font text-lg">{product.name}</div>
          <div className="mt-1 font-bold text-[#151515]/60">{product.price.toLocaleString("ru-RU")} ₽</div>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-[#151515]/60">Цвет</div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((item) => (
              <button
                key={item}
                onClick={() => setColor(item)}
                className={`rounded-full border px-3 py-2 text-sm font-bold ${
                  color === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515]/15 bg-white text-[#151515]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-[#151515]/60">Размер</div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((item) => (
              <button
                key={item}
                onClick={() => setSize(item)}
                className={`min-w-11 rounded-full border px-3 py-2 text-sm font-bold ${
                  size === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515]/15 bg-white text-[#151515]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-[#151515]/60">Количество</div>
          <div className="inline-flex items-center rounded-full border border-[#151515]/15 bg-white">
            <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3" aria-label="Уменьшить">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-bold">{quantity}</span>
            <button onClick={() => setQuantity((value) => Math.min(9, value + 1))} className="p-3" aria-label="Увеличить">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#151515]/60">Telegram или телефон</span>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="w-full rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"
            placeholder="@username"
          />
        </label>

        <div className="rounded-2xl border border-[#151515]/10 bg-white p-4 text-sm font-semibold text-[#151515]/80">
          <pre className="whitespace-pre-wrap font-sans">{orderText}</pre>
        </div>

        <button
          onClick={shareOrder}
          className="brand-button inline-flex w-full items-center justify-center gap-2 px-4 py-3"
        >
          {copied ? <Check className="h-5 w-5" /> : canShare ? <Send className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copied ? "Заявка скопирована" : "Отправить заявку"}
        </button>
      </div>
    </aside>
  )
}
