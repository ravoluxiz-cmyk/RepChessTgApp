"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Copy, Minus, Plus, Send, ShoppingBag } from "lucide-react"
import ChessBackground from "@/components/ChessBackground"

const products = [
  {
    id: "repchess-merch-01",
    name: "White I Hate Chess Tee",
    price: 2500,
    image: "/merch/repchess-merch-01.jpg",
    colors: ["Белый"],
  },
  {
    id: "repchess-merch-02",
    name: "Graphite I Hate Chess Tee",
    price: 2500,
    image: "/merch/repchess-merch-02.jpg",
    colors: ["Графит"],
  },
  {
    id: "repchess-merch-03",
    name: "Red I Hate Chess Tee",
    price: 2500,
    image: "/merch/repchess-merch-03.jpg",
    colors: ["Красный"],
  },
  {
    id: "repchess-merch-04",
    name: "RepChess Merch 04",
    price: 3500,
    image: "/merch/repchess-merch-04.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-05",
    name: "RepChess Merch 05",
    price: 3500,
    image: "/merch/repchess-merch-05.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-06",
    name: "RepChess Merch 06",
    price: 3500,
    image: "/merch/repchess-merch-06.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-07",
    name: "RepChess Merch 07",
    price: 3500,
    image: "/merch/repchess-merch-07.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-08",
    name: "RepChess Merch 08",
    price: 3500,
    image: "/merch/repchess-merch-08.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-09",
    name: "RepChess Merch 09",
    price: 3500,
    image: "/merch/repchess-merch-09.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-10",
    name: "RepChess Merch 10",
    price: 3500,
    image: "/merch/repchess-merch-10.jpg",
    colors: ["Уточнить"],
  },
]

const sizes = ["S", "M", "L", "XL"]

export default function MerchPage() {
  const router = useRouter()
  const [canShare, setCanShare] = useState(false)
  const [productId, setProductId] = useState(products[0].id)
  const product = products.find((item) => item.id === productId) || products[0]
  const [size, setSize] = useState("M")
  const [color, setColor] = useState(product.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [contact, setContact] = useState("")
  const [copied, setCopied] = useState(false)

  const orderText = useMemo(() => {
    const total = product.price * quantity
    return [
      "Заказ REP CHESS",
      `Товар: ${product.name}`,
      `Артикул: ${product.id}`,
      `Цвет: ${color}`,
      `Размер: ${size}`,
      `Количество: ${quantity}`,
      `Итого: ${total.toLocaleString("ru-RU")} ₽`,
      contact ? `Контакт: ${contact}` : null,
    ].filter(Boolean).join("\n")
  }, [color, contact, product.id, product.name, product.price, quantity, size])

  useEffect(() => {
    setCanShare(Boolean(navigator.share))
  }, [])

  const selectProduct = (id: string) => {
    const next = products.find((item) => item.id === id)
    if (!next) return
    setProductId(id)
    setColor(next.colors[0])
  }

  const shareOrder = async () => {
    setCopied(false)
    try {
      if (navigator.share) {
        await navigator.share({ title: "Заказ REP CHESS", text: orderText })
        return
      }
      await navigator.clipboard.writeText(orderText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <ChessBackground>
      <div className="min-h-screen w-full px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex items-center justify-between gap-3">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Главная</span>
            </button>
            <div className="inline-flex items-center gap-2 text-white/80">
              <ShoppingBag className="h-5 w-5 text-emerald-300" />
              <span className="font-semibold">Мерч</span>
            </div>
          </header>

          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => selectProduct(item.id)}
                  className={`group overflow-hidden rounded-lg border text-left text-white transition-colors ${
                    item.id === product.id
                      ? "border-emerald-300/70 bg-emerald-400/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="relative bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                    <div className="absolute left-3 top-3 rounded-lg bg-black/65 px-2.5 py-1 text-xs font-bold text-white">
                      {item.price.toLocaleString("ru-RU")} ₽
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-bold">{item.name}</div>
                    <div className="mt-1 text-sm text-white/55">{item.id}</div>
                  </div>
                </button>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-white/10 bg-white/5 p-5 text-white backdrop-blur-lg lg:sticky lg:top-6">
              <h1 className="mb-4 text-3xl font-black">Заказ</h1>

              <div className="space-y-5">
                <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
                </div>

                <div>
                  <div className="text-xl font-bold">{product.name}</div>
                  <div className="mt-1 text-white/60">{product.price.toLocaleString("ru-RU")} ₽</div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-white/60">Цвет</div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((item) => (
                      <button
                        key={item}
                        onClick={() => setColor(item)}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          color === item ? "border-emerald-300 bg-emerald-400/20" : "border-white/10 bg-white/5"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-white/60">Размер</div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSize(item)}
                        className={`min-w-11 rounded-lg border px-3 py-2 text-sm ${
                          size === item ? "border-amber-300 bg-amber-400/20" : "border-white/10 bg-white/5"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-white/60">Количество</div>
                  <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5">
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
                  <span className="mb-2 block text-sm font-semibold text-white/60">Telegram или телефон</span>
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-300"
                    placeholder="@username"
                  />
                </label>

                <div className="rounded-lg bg-black/30 p-4 text-sm text-white/80">
                  <pre className="whitespace-pre-wrap font-sans">{orderText}</pre>
                </div>

                <button
                  onClick={shareOrder}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-white/90"
                >
                  {copied ? <Check className="h-5 w-5" /> : canShare ? <Send className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  {copied ? "Заявка скопирована" : "Отправить заявку"}
                </button>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </ChessBackground>
  )
}
