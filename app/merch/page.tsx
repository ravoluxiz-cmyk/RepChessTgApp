"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Copy, Minus, Plus, Send, ShoppingBag } from "lucide-react"
import ChessBackground from "@/components/ChessBackground"

const products = [
  {
    id: "repchess-merch-01",
    name: "Белая футболка I Hate Chess",
    price: 2500,
    image: "/merch/repchess-merch-01.jpg",
    colors: ["Белый"],
  },
  {
    id: "repchess-merch-02",
    name: "Графитовая футболка Я ненавижу шахматы",
    price: 2500,
    image: "/merch/repchess-merch-02.jpg",
    colors: ["Графит"],
  },
  {
    id: "repchess-merch-03",
    name: "Красная футболка I Hate Chess",
    price: 2500,
    image: "/merch/repchess-merch-03.jpg",
    colors: ["Красный"],
  },
  {
    id: "repchess-merch-04",
    name: "Клубный мерч Rep Chess KRD 04",
    price: 3500,
    image: "/merch/repchess-merch-04.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-05",
    name: "Клубный мерч Rep Chess KRD 05",
    price: 3500,
    image: "/merch/repchess-merch-05.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-06",
    name: "Клубный мерч Rep Chess KRD 06",
    price: 3500,
    image: "/merch/repchess-merch-06.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-07",
    name: "Клубный мерч Rep Chess KRD 07",
    price: 3500,
    image: "/merch/repchess-merch-07.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-08",
    name: "Клубный мерч Rep Chess KRD 08",
    price: 3500,
    image: "/merch/repchess-merch-08.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-09",
    name: "Клубный мерч Rep Chess KRD 09",
    price: 3500,
    image: "/merch/repchess-merch-09.jpg",
    colors: ["Уточнить"],
  },
  {
    id: "repchess-merch-10",
    name: "Клубный мерч Rep Chess KRD 10",
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
      "Заказ REP CHESS KRD",
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
        await navigator.share({ title: "Заказ REP CHESS KRD", text: orderText })
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
              className="brand-underlink inline-flex items-center gap-2 px-3 py-2 text-white transition-colors hover:text-white/70"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Главная</span>
            </button>
            <div className="brand-chip inline-flex items-center gap-2 px-3 py-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="brand-font text-sm">Мерч</span>
            </div>
          </header>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-icons pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-[0.08]" />
            <div className="grid gap-5 md:grid-cols-[1fr_260px] md:items-end">
              <div>
                <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Drop / Lookbook</div>
                <h1 className="brand-title text-4xl text-white sm:text-6xl">REP CHESS KRD MERCH</h1>
                <p className="mt-4 max-w-2xl text-white/62">
                  Футболки, дропы и вещи клуба. Выберите позицию, размер и отправьте заявку в пару касаний.
                </p>
                <div className="brand-accent-line mt-5 w-52" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center md:grid-cols-1 md:text-left">
                <div className="rounded-2xl bg-white px-3 py-3 text-[#151515]">
                  <div className="brand-font text-2xl">{products.length}</div>
                  <div className="text-xs font-black uppercase opacity-60">позиций</div>
                </div>
                <div className="rounded-2xl bg-[#ff1515] px-3 py-3 text-white">
                  <div className="brand-font text-2xl">2.5+</div>
                  <div className="text-xs font-black uppercase opacity-80">тыс ₽</div>
                </div>
                <div className="rounded-2xl bg-[#fff200] px-3 py-3 text-[#151515]">
                  <div className="brand-font text-2xl">S-XL</div>
                  <div className="text-xs font-black uppercase opacity-70">размеры</div>
                </div>
              </div>
            </div>
          </div>

          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => selectProduct(item.id)}
                  className={`group overflow-hidden rounded-[18px] text-left text-[#151515] transition-transform hover:-translate-y-1 ${
                    item.id === product.id
                      ? "brand-panel"
                      : "brand-panel"
                  }`}
                >
                  <div className="relative border-b border-[#151515]/10 bg-[#151515]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                    <div className="brand-font absolute left-3 top-3 rounded-full border border-[#151515]/15 bg-white px-2.5 py-1 text-xs text-black shadow-lg">
                      {item.price.toLocaleString("ru-RU")} ₽
                    </div>
                    {item.id === product.id && (
                      <div className="brand-font absolute bottom-3 right-3 rounded-full border border-[#151515]/15 bg-[#ffd600] px-2.5 py-1 text-xs text-black shadow-lg">
                        Выбрано
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="brand-font text-sm">{item.name}</div>
                    <div className="mt-1 text-sm font-semibold text-[#151515]/55">{item.id}</div>
                  </div>
                </button>
              ))}
            </div>

            <aside className="brand-panel h-fit rounded-[18px] p-5 text-[#151515] lg:sticky lg:top-6">
              <h2 className="brand-title mb-4 text-3xl">Заказ</h2>

              <div className="space-y-5">
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
          </section>
        </div>
      </div>
    </ChessBackground>
  )
}
