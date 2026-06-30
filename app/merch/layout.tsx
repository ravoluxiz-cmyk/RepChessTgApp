import type { Metadata } from "next"
import { merchProducts } from "@/lib/merch-products"

const productListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Шахматный мерч Rep Chess KRD",
  itemListElement: merchProducts.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      sku: product.id,
      image: `https://repchesskrd.ru${product.image}`,
      description: product.seoDescription,
      brand: {
        "@type": "Brand",
        name: "Rep Chess KRD",
      },
      category: product.category,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: `https://repchesskrd.ru/merch#${product.id}`,
      },
    },
  })),
}

export const metadata: Metadata = {
  title: "Шахматный мерч Rep Chess KRD - футболки, лонгсливы и клубные вещи",
  description: "Купить шахматный мерч Rep Chess KRD в Краснодаре: футболки I Hate Chess, лонгсливы, клубная одежда, цены, размеры и заявка на заказ.",
  alternates: {
    canonical: "/merch",
  },
  openGraph: {
    title: "Шахматный мерч Rep Chess KRD",
    description: "Футболки, лонгсливы и клубные вещи Rep Chess KRD для шахматного комьюнити Краснодара.",
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
