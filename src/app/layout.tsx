import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TelegramProvider } from "@/components/TelegramProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "VPN Friends — Защита личных данных и анонимный серфинг",
  description:
    "VPN Friends — надёжный VPN-сервис для России. Защита личных данных, анонимный серфинг, высокая скорость. Подключение через Telegram за минуту. Тарифы от 99 ₽.",
  keywords:
    "VPN, защита личных данных, анонимный серфинг, безопасный интернет, VPN Telegram, конфиденциальность",
  authors: [{ name: "VPN Friends" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://vpnfriends.ru/",
    title: "VPN Friends — Защита личных данных и анонимный серфинг",
    description:
      "Надёжный VPN для России. Защита данных, анонимный серфинг, подключение через Telegram. Тарифы от 99 ₽.",
    images: [
      {
        url: "https://vpnfriends.ru/iconvpn.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ru_RU",
    siteName: "VPN Friends",
  },
  twitter: {
    card: "summary_large_image",
    title: "VPN Friends — Защита личных данных и анонимный серфинг",
    description:
      "Надёжный VPN для России. Защита данных, анонимный серфинг. Подключение через Telegram.",
    images: ["https://vpnfriends.ru/iconvpn.png"],
  },
  icons: {
    icon: "/iconvpn.png",
    apple: "/iconvpn.png",
  },
  other: {
    "theme-color": "#00d26a",
    "msapplication-TileColor": "#00d26a",
    "geo.region": "RU",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://vpnfriends.ru/" />
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://vpnfriends.ru/#website",
                  url: "https://vpnfriends.ru/",
                  name: "VPN Friends",
                  description:
                    "Надёжный VPN-сервис для России. Защита личных данных, анонимный серфинг, подключение через Telegram.",
                  inLanguage: "ru-RU",
                  publisher: {
                    "@id": "https://vpnfriends.ru/#organization",
                  },
                },
                {
                  "@type": "Organization",
                  "@id": "https://vpnfriends.ru/#organization",
                  name: "VPN Friends",
                  url: "https://vpnfriends.ru/",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://vpnfriends.ru/iconvpn.png",
                  },
                },
                {
                  "@type": "WebPage",
                  "@id": "https://vpnfriends.ru/#webpage",
                  url: "https://vpnfriends.ru/",
                  name: "VPN Friends — Защита личных данных и анонимный серфинг",
                  description:
                    "Защита личных данных и анонимный серфинг. Тарифы от 99 ₽.",
                  isPartOf: { "@id": "https://vpnfriends.ru/#website" },
                  inLanguage: "ru-RU",
                  about: { "@id": "https://vpnfriends.ru/#organization" },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <TelegramProvider>{children}</TelegramProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
