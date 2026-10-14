"use client"

import { useRef, useState } from "react"
import MerchOrderWidget, { type OrderProduct } from "./merch-order-widget"
import styles from "./merch.module.css"

export default function MerchCatalog({ products }: { products: OrderProduct[] }) {
  const [productId, setProductId] = useState(products[0]?.id || "")
  const orderHeading = useRef<HTMLHeadingElement>(null)

  const chooseProduct = (id: string) => {
    setProductId(id)
    orderHeading.current?.focus({ preventScroll: true })
    orderHeading.current?.scrollIntoView({ behavior: "auto", block: "start" })
  }

  return (
    <section className={styles.shop} aria-label="Каталог и заявка на мерч">
      <div>
        <div className={styles.catalogHeading}>
          <h2 className="brand-title">Выбери свою.</h2>
          <span>Три футболки · одна клубная история</span>
        </div>
        <div className={styles.catalog}>
          {products.map((product, index) => (
            <article id={product.id} key={product.id} className={styles.card}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt={product.name} className={styles.photo} width={853} height={1280} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
              <div className={styles.cardBody}>
                <p className={styles.productMeta}>{product.colors.join(" / ")} · {product.fit}</p>
                <h3 className="brand-title">{product.name.replace(/^Футболка (белая|графитовая|красная) /, "")}</h3>
                <p className={styles.description}>{product.shortDescription}</p>
                <div className={styles.cardBottom}>
                  <span className={styles.price}>{product.price.toLocaleString("ru-RU")} ₽</span>
                  <span className={styles.sizes}>S / M / L / XL</span>
                </div>
                <button type="button" className={styles.choose} onClick={() => chooseProduct(product.id)} aria-label={`Выбрать ${product.name}`}>
                  Выбрать футболку <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.catalogNote}>Наличие нужного размера, оплату и передачу уточним при обсуждении заказа.</p>
      </div>
      <MerchOrderWidget products={products} productId={productId} onSelectProduct={setProductId} headingRef={orderHeading} />
    </section>
  )
}
