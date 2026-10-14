import type { Metadata } from "next"
import { PublicHomeLink } from "@/components/public/public-home-link"
import ChessBackground from "@/components/ChessBackground"
import MerchCatalog from "@/components/merch/merch-catalog"
import styles from "@/components/merch/merch.module.css"
import { JsonLd } from "@/components/seo/json-ld"
import { merchProducts } from "@/lib/merch-products"
import { buildBreadcrumbJsonLd, buildGraphJsonLd, buildProductJsonLd } from "@/lib/seo"

const orderProducts = merchProducts.map(({ id, name, price, image, colors, shortDescription, fit }) => ({
  id, name, price, image, colors, shortDescription, fit,
}))

const merchJsonLd = buildGraphJsonLd([
  {
    "@type": "CollectionPage",
    "@id": "https://repchesskrd.ru/merch#webpage",
    name: "Шахматный мерч Rep Chess KRD",
    url: "https://repchesskrd.ru/merch",
    inLanguage: "ru-RU",
    isPartOf: { "@id": "https://repchesskrd.ru/#website" },
    about: { "@id": "https://repchesskrd.ru/#organization" },
  },
  buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Мерч", path: "/merch" },
  ]),
  ...merchProducts.map(buildProductJsonLd),
])

export const metadata: Metadata = {
  title: "Шахматный мерч — футболки I Hate Chess",
  description: "Футболки Rep Chess KRD: I Hate Chess и «Я ненавижу шахматы». Три дизайна, фотографии, цены и подготовка заявки на заказ.",
  alternates: { canonical: "/merch" },
  openGraph: {
    title: "Шахматный мерч Rep Chess KRD",
    description: "Три футболки Rep Chess KRD: I Hate Chess и «Я ненавижу шахматы». Фото, цены и выбор размера.",
    url: "https://repchesskrd.ru/merch",
  },
}

type MerchPageProps = {
  searchParams?: Promise<{ from?: string }>
}

export default async function MerchPage({ searchParams }: MerchPageProps) {
  const params = searchParams ? await searchParams : {}
  const backHref = params?.from === "site-menu" ? "/#site-menu" : "/"

  return (
    <ChessBackground editorial>
      <JsonLd data={merchJsonLd} />
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.navigation}>
            <PublicHomeLink href={backHref} />
            <span className={styles.eyebrow}>REP CHESS KRD · МЕРЧ</span>
          </header>
          <section className={styles.hero} aria-labelledby="merch-title">
            <div>
              <h1 id="merch-title" className="brand-title">Клубный<br /><span className={styles.highlight}>мерч.</span></h1>
              <p className={styles.tagline}>За доской. И вне игры.</p>
            </div>
            <p className={styles.intro}>Шахматная ирония, которую можно надеть. Выбери футболку и размер — детали заказа обсудим лично.</p>
          </section>
          <MerchCatalog products={orderProducts} />
          <footer className={styles.footer}>
            <span>CHESS IS REP</span>
            <span>КРАСНОДАР</span>
          </footer>
        </div>
      </main>
    </ChessBackground>
  )
}
