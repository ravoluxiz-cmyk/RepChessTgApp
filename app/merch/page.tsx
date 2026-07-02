import Link from "next/link"
import ChessBackground from "@/components/ChessBackground"
import MerchOrderWidget from "@/components/merch/merch-order-widget"
import { merchProducts } from "@/lib/merch-products"

const orderProducts = merchProducts.map(({ id, name, price, image, colors }) => ({
  id,
  name,
  price,
  image,
  colors,
}))

export default function MerchPage() {
  return (
    <ChessBackground>
      <div className="min-h-screen w-full px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="brand-underlink inline-flex items-center gap-2 px-3 py-2 text-white transition-colors hover:text-white/70"
              aria-label="Назад"
            >
              <span aria-hidden="true">←</span>
              <span className="font-semibold">Главная</span>
            </Link>
          </header>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-icons pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-[0.08]" />
            <div className="grid gap-5">
              <div>
                <h1 className="brand-title text-[2.45rem] leading-none text-white sm:text-6xl">Шахматный мерч Rep Chess KRD</h1>
                <p className="mt-4 max-w-3xl text-white/62">
                  Футболки, лонгсливы и клубные вещи для тех, кто играет в шахматы в Краснодаре, ходит на турниры Rep Chess KRD и хочет носить мерч с живой клубной историей.
                </p>
                <div className="brand-accent-line mt-5 w-52" />
              </div>
            </div>
          </div>

          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-5">
              {merchProducts.map((item, index) => (
                <article
                  key={item.id}
                  id={item.id}
                  className="brand-panel overflow-hidden text-[#151515]"
                  itemScope
                  itemType="https://schema.org/Product"
                >
                  <meta itemProp="sku" content={item.id} />
                  <meta itemProp="brand" content="Rep Chess KRD" />
                  <meta itemProp="category" content={item.category} />
                  <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
                    <div className="relative self-start border-b border-[#151515]/10 bg-[#151515] lg:border-b-0 lg:border-r">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={`${item.name} - шахматный мерч Rep Chess KRD`}
                        className="aspect-[4/5] w-full bg-[#151515] object-contain"
                        loading={index < 2 ? "eager" : "lazy"}
                        itemProp="image"
                      />
                      <div className="brand-font absolute left-3 top-3 rounded-full border border-[#151515]/15 bg-white px-2.5 py-1 text-xs text-black shadow-lg">
                        {item.price.toLocaleString("ru-RU")} ₽
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <h2 className="brand-title text-3xl leading-none sm:text-4xl" itemProp="name">{item.name}</h2>
                      <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-[#151515]/62" itemProp="description">
                        {item.shortDescription}
                      </p>

                      <div className="mt-5 grid gap-3 text-sm font-bold text-[#151515]/68 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[#151515]/10 bg-white px-4 py-3">
                          <div className="text-xs font-black uppercase opacity-50">Цена</div>
                          <div className="mt-1 text-[#151515]" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                            <meta itemProp="priceCurrency" content="RUB" />
                            <meta itemProp="availability" content="https://schema.org/InStock" />
                            <meta itemProp="url" content={`https://repchesskrd.ru/merch#${item.id}`} />
                            <data itemProp="price" value={String(item.price)}>{item.price.toLocaleString("ru-RU")} ₽</data>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#151515]/10 bg-white px-4 py-3">
                          <div className="text-xs font-black uppercase opacity-50">Размеры</div>
                          <div className="mt-1 text-[#151515]">S / M / L / XL</div>
                        </div>
                        <div className="rounded-2xl border border-[#151515]/10 bg-white px-4 py-3">
                          <div className="text-xs font-black uppercase opacity-50">Заказ</div>
                          <a className="mt-1 inline-flex text-[#151515] underline decoration-[#151515]/30 underline-offset-4" href="#merch-order">
                            Выбрать справа
                          </a>
                        </div>
                      </div>

                      <details className="mt-5 rounded-2xl border border-[#151515]/10 bg-white p-4">
                        <summary className="cursor-pointer text-sm font-black uppercase text-[#151515]">
                          Полное описание товара
                        </summary>
                        <div className="mt-4 space-y-4 text-sm font-semibold leading-relaxed text-[#151515]/68">
                          {item.seoParagraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div id="merch-order">
              <MerchOrderWidget products={orderProducts} />
            </div>
          </section>
        </div>
      </div>
    </ChessBackground>
  )
}
