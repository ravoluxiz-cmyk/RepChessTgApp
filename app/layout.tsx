import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import SupportChatWidget from "@/components/support-chat-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION || undefined;
const yandexVerification = process.env.YANDEX_VERIFICATION || undefined;

export const metadata: Metadata = {
  metadataBase: new URL("https://repchesskrd.ru"),
  title: {
    default: "Rep Chess KRD - шахматы в Краснодаре, турниры и Telegram-канал",
    template: "%s | Rep Chess KRD",
  },
  description: "Rep Chess KRD - шахматное комьюнити Краснодара: Telegram-канал, турниры по шахматам, уроки для начинающих, лекции, мерч и корпоративные шахматные мероприятия.",
  keywords: [
    "шахматы Краснодар",
    "шахматы в Краснодаре",
    "играть в шахматы Краснодар",
    "шахматный клуб Краснодар",
    "шахматные турниры Краснодар",
    "турниры по шахматам Краснодар",
    "уроки шахмат Краснодар",
    "шахматы для начинающих Краснодар",
    "обучение шахматам Краснодар",
    "шахматное комьюнити Краснодар",
    "шахматный мерч",
    "шахматные корпоративы Краснодар",
    "мероприятия по шахматам Краснодар",
    "Rep Chess KRD",
    "Реп Чесс Краснодар",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rep Chess KRD - шахматы в Краснодаре",
    description: "Telegram-канал, турниры, уроки, лекции, мерч и шахматные мероприятия Rep Chess KRD.",
    url: "https://repchesskrd.ru",
    siteName: "Rep Chess KRD",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rep Chess KRD - шахматы в Краснодаре",
    description: "Telegram-канал, турниры, уроки, лекции, мерч и шахматные мероприятия Rep Chess KRD.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: googleSiteVerification,
    yandex: yandexVerification,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "Rep Chess KRD",
  alternateName: [
    "Реп Чесс Краснодар",
    "Rep Chess Краснодар",
  ],
  url: "https://repchesskrd.ru",
  sport: "Chess",
  areaServed: {
    "@type": "City",
    name: "Краснодар",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://t.me/RepChessKRD",
    availableLanguage: "Russian",
  },
  sameAs: [
    "https://repchess.ru",
    "https://t.me/RepChessKRD",
  ],
  description: "Шахматное комьюнити в Краснодаре: Telegram-канал, турниры, уроки, лекции, клубные встречи, мерч и корпоративные шахматные мероприятия.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SupportChatWidget />
      </body>
    </html>
  );
}
