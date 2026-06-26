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

export const metadata: Metadata = {
  metadataBase: new URL("https://repchesskrd.ru"),
  title: {
    default: "Rep Chess KRD - шахматный клуб в Краснодаре",
    template: "%s | Rep Chess KRD",
  },
  description: "Rep Chess KRD - шахматный клуб в Краснодаре: турниры, уроки, лекции, мерч, корпоративные шахматные мероприятия и клубное комьюнити.",
  keywords: [
    "шахматный клуб Краснодар",
    "шахматные турниры Краснодар",
    "шахматы Краснодар",
    "уроки шахмат Краснодар",
    "Rep Chess KRD",
    "шахматные мероприятия",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rep Chess KRD - шахматный клуб в Краснодаре",
    description: "Турниры, уроки, лекции, мерч и шахматные мероприятия Rep Chess KRD.",
    url: "https://repchesskrd.ru",
    siteName: "Rep Chess KRD",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rep Chess KRD - шахматный клуб в Краснодаре",
    description: "Турниры, уроки, лекции, мерч и шахматные мероприятия Rep Chess KRD.",
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
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "Rep Chess KRD",
  url: "https://repchesskrd.ru",
  sport: "Chess",
  areaServed: {
    "@type": "City",
    name: "Краснодар",
  },
  sameAs: [
    "https://repchess.ru",
  ],
  description: "Шахматный клуб в Краснодаре: турниры, уроки, лекции, клубные встречи и корпоративные шахматные мероприятия.",
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
