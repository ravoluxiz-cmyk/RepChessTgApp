import type { Metadata } from "next"

const merchItems = [
  ["White I Hate Chess Tee", 2500],
  ["Graphite I Hate Chess Tee", 2500],
  ["Red I Hate Chess Tee", 2500],
  ["Rep Chess KRD Merch 04", 3500],
  ["Rep Chess KRD Merch 05", 3500],
  ["Rep Chess KRD Merch 06", 3500],
  ["Rep Chess KRD Merch 07", 3500],
  ["Rep Chess KRD Merch 08", 3500],
  ["Rep Chess KRD Merch 09", 3500],
  ["Rep Chess KRD Merch 10", 3500],
] as const

const productListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Шахматный мерч Rep Chess KRD",
  itemListElement: merchItems.map(([name, price], index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name,
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
  title: "Шахматный мерч Rep Chess KRD",
  description: "Футболки и клубный мерч Rep Chess KRD: шахматная одежда, актуальные карточки товаров, цены и оформление заказа.",
  alternates: {
    canonical: "/merch",
  },
  openGraph: {
    title: "Шахматный мерч Rep Chess KRD",
    description: "Клубные футболки и мерч Rep Chess KRD.",
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
