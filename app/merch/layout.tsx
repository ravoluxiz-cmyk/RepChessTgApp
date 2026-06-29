import type { Metadata } from "next"

const merchItems = [
  ["Белая футболка I Hate Chess", 2500, "repchess-merch-01.jpg"],
  ["Графитовая футболка Я ненавижу шахматы", 2500, "repchess-merch-02.jpg"],
  ["Красная футболка I Hate Chess", 2500, "repchess-merch-03.jpg"],
  ["Клубный мерч Rep Chess KRD 04", 3500, "repchess-merch-04.jpg"],
  ["Клубный мерч Rep Chess KRD 05", 3500, "repchess-merch-05.jpg"],
  ["Клубный мерч Rep Chess KRD 06", 3500, "repchess-merch-06.jpg"],
  ["Клубный мерч Rep Chess KRD 07", 3500, "repchess-merch-07.jpg"],
  ["Клубный мерч Rep Chess KRD 08", 3500, "repchess-merch-08.jpg"],
  ["Клубный мерч Rep Chess KRD 09", 3500, "repchess-merch-09.jpg"],
  ["Клубный мерч Rep Chess KRD 10", 3500, "repchess-merch-10.jpg"],
] as const

const productListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Шахматный мерч Rep Chess KRD",
  itemListElement: merchItems.map(([name, price, image], index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name,
      image: `https://repchesskrd.ru/merch/${image}`,
      description: `${name}: клубная вещь Rep Chess KRD для шахматного комьюнити Краснодара.`,
      brand: {
        "@type": "Brand",
        name: "Rep Chess KRD",
      },
      category: "Apparel",
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: "https://repchesskrd.ru/merch",
      },
    },
  })),
}

export const metadata: Metadata = {
  title: "Шахматный мерч Rep Chess KRD - футболки и клубные вещи",
  description: "Клубный шахматный мерч Rep Chess KRD: футболки I Hate Chess, вещи клуба, карточки товаров, цены, размеры и заявка на заказ в Краснодаре.",
  alternates: {
    canonical: "/merch",
  },
  openGraph: {
    title: "Шахматный мерч Rep Chess KRD",
    description: "Футболки I Hate Chess и клубные вещи Rep Chess KRD.",
    url: "https://repchesskrd.ru/merch",
  },
}

export default function MerchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListJsonLd) }}
      />
      {children}
    </>
  )
}
