"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { BOT_URL, SUPPORT_TG } from "@/lib/constants";
import {
  ShieldCheckIcon,
  LockIcon,
  LightningIcon,
  GlobeIcon,
  CheckIcon,
} from "./LandingIcons";
import { LandingButton } from "./LandingButton";
import { TermsOfService, PrivacyPolicy, RefundPolicy } from "./LegalContent";

const LOGO_SRC = "/iconvpn1.png";

const SEO_TITLES: Record<string, string> = {
  "": "VPN Friends — Защита личных данных и анонимный серфинг",
  "#terms": "Пользовательское соглашение — VPN Friends",
  "#privacy": "Политика обработки данных — VPN Friends",
  "#refund": "Условия возврата средств — VPN Friends",
};

export function Landing() {
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    setCurrentHash(window.location.hash);

    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const title = SEO_TITLES[currentHash] ?? SEO_TITLES[""];
    document.title = title;
  }, [currentHash]);

  const renderContent = () => {
    switch (currentHash) {
      case "#terms":
        return <TermsOfService />;
      case "#privacy":
        return <PrivacyPolicy />;
      case "#refund":
        return <RefundPolicy />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-appBg text-white selection:bg-brandGreen selection:text-black">
      <Header />
      <main className="flex-grow">{renderContent()}</main>
      <Footer />
    </div>
  );
}

const Header = () => (
  <header className="sticky top-0 z-50 bg-appBg/80 backdrop-blur-md border-b border-panelBorder/50">
    <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
      <a href="#" className="flex items-center space-x-3 group">
        <Image
          src={LOGO_SRC}
          alt="VPN Friends"
          width={80}
          height={80}
          className="w-10 h-10 flex-shrink-0 rounded-xl object-contain"
        />
        <span className="text-xl font-bold tracking-tight text-white">
          VPN Friends
        </span>
      </a>
      <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
        <a href="#features" className="hover:text-white transition-colors">
          Преимущества
        </a>
        <a href="#pricing" className="hover:text-white transition-colors">
          Тарифы
        </a>
        <a href="#contact" className="hover:text-white transition-colors">
          Контакты
        </a>
      </div>
      <LandingButton
        href={BOT_URL}
        variant="outline"
        className="hidden sm:flex py-2 px-4 text-sm"
      >
        Подключить
      </LandingButton>
    </div>
  </header>
);

const LandingPage = () => (
  <>
    {/* Hero */}
    <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brandGreen/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto px-4 text-center relative z-10 mb-[15vh] md:mb-[5vh] mt-8 md:mt-0">
        <div className="inline-flex items-center space-x-2 bg-panelBg border border-panelBorder rounded-full px-4 py-1.5 mb-8">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandGreen opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brandGreen" />
          </span>
          <span className="text-sm font-medium text-gray-300">
            Серверы работают стабильно
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Защита личных данных <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandGreen to-emerald-300">
            и анонимный серфинг
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Надежный сервис для безопасного доступа к сети. Современные протоколы
          шифрования обеспечат полную конфиденциальность вашей активности в
          интернете.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <LandingButton href={BOT_URL} className="w-full sm:w-auto text-lg">
            Подключить через Telegram
          </LandingButton>
          <p className="text-sm text-gray-500 sm:hidden">
            Без сложных регистраций
          </p>
        </div>
      </div>
    </section>

    {/* Features */}
    <section
      id="features"
      className="py-24 bg-panelBg/30 border-y border-panelBorder/50"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Мы предоставляем качественный сервис, фокусируясь на вашей
            безопасности и скорости соединения.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<LockIcon className="w-8 h-8 text-brandGreen" />}
            title="Защита данных"
            description="Военный стандарт шифрования AES-256 гарантирует, что ваши пароли, переписки и платежные данные останутся в безопасности."
          />
          <FeatureCard
            icon={<GlobeIcon className="w-8 h-8 text-brandGreen" />}
            title="Анонимный серфинг"
            description="Скрываем ваш реальный IP-адрес. Политика Strict No-Logs: мы не сохраняем историю вашей активности в сети."
          />
          <FeatureCard
            icon={<LightningIcon className="w-8 h-8 text-brandGreen" />}
            title="Высокая скорость"
            description="Оптимизированные серверы обеспечивают стабильное соединение без задержек. Смотрите видео в 4K и скачивайте файлы мгновенно."
          />
        </div>
      </div>
    </section>

    {/* App Interface Mockup */}
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-[#111] border border-panelBorder rounded-[32px] p-2 shadow-2xl relative">
          <div className="flex items-center px-4 py-3 border-b border-panelBorder/50">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="mx-auto text-sm font-medium text-gray-300">
              VPN Friends
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col items-center">
            <div className="text-gray-400 mb-8">Подключено</div>

            <div className="w-40 h-40 rounded-full border-[8px] border-brandGreen/20 flex items-center justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-brandGreen/10 flex items-center justify-center">
                <ShieldCheckIcon className="w-16 h-16 text-brandGreen" />
              </div>
            </div>

            <div className="bg-brandGreen/20 text-brandGreen px-6 py-2 rounded-full font-medium mb-12">
              Защищено
            </div>

            <div className="w-full max-w-md bg-panelBg border border-panelBorder rounded-2xl p-6 mb-8">
              <div className="text-sm text-gray-400 mb-2">Сервер</div>
              <div className="bg-appBg border border-panelBorder rounded-xl p-4 flex justify-between items-center">
                <span className="font-medium text-white">
                  Europe (Premium)
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section
      id="pricing"
      className="py-24 bg-panelBg/30 border-y border-panelBorder/50"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Простые и понятные тарифы
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Выберите план, который подходит именно вам. Оплата происходит быстро
            и безопасно прямо в Telegram.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="1 месяц"
            price="199 ₽"
            subtitle="Идеально для старта"
            features={[
              "Неограниченный трафик",
              "Поддержка 24/7",
              "Высокая скорость",
            ]}
          />
          <PricingCard
            title="3 месяца"
            price="449 ₽"
            subtitle="Оптимальный выбор"
            features={[
              "Неограниченный трафик",
              "Поддержка 24/7",
              "Высокая скорость",
              "Скидка ~25%",
            ]}
            isPopular
          />
          <PricingCard
            title="1 год"
            price="1499 ₽"
            subtitle="Максимальная выгода"
            features={[
              "Неограниченный трафик",
              "Поддержка 24/7",
              "Высокая скорость",
              "Скидка ~37%",
            ]}
          />
        </div>
      </div>
    </section>

    {/* Contact */}
    <section id="contact" className="py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Остались вопросы?</h2>
        <p className="text-gray-400 mb-10">
          Наша служба поддержки всегда готова помочь вам с настройкой или
          ответить на любые вопросы.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center">
          <a
            href={SUPPORT_TG}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-3 bg-panelBg hover:bg-panelBorder transition-colors border border-panelBorder rounded-xl px-6 py-4 w-auto"
          >
            <svg
              className="w-6 h-6 text-[#229ED9]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.123-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span className="font-medium text-white">Telegram Support</span>
          </a>
        </div>
      </div>
    </section>
  </>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-panelBg border border-panelBorder rounded-2xl p-8 hover:border-brandGreen/50 transition-colors duration-300">
    <div className="w-14 h-14 bg-brandGreen/10 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({
  title,
  price,
  subtitle,
  features,
  isPopular,
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  isPopular?: boolean;
}) => (
  <div
    className={`relative flex flex-col bg-panelBg rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 ${
      isPopular
        ? "border-2 border-brandGreen shadow-[0_0_40px_rgba(0,210,106,0.15)]"
        : "border border-panelBorder"
    }`}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brandGreen text-black font-bold px-4 py-1 rounded-full text-sm">
        Хит продаж
      </div>
    )}
    <div className="mb-8">
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <div className="text-gray-400 text-sm mb-4">{subtitle}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{price}</span>
      </div>
    </div>

    <ul className="space-y-4 mb-8 flex-grow">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start">
          <CheckIcon className="w-5 h-5 text-brandGreen mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>

    <LandingButton
      href={BOT_URL}
      variant={isPopular ? "primary" : "outline"}
      className="w-full"
    >
      Оформить подписку
    </LandingButton>
  </div>
);

const Footer = () => (
  <footer className="bg-appBg border-t border-panelBorder py-12 mt-auto">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
      <div className="flex flex-col items-center md:items-start">
        <div className="flex items-center space-x-2 mb-4">
          <Image
            src={LOGO_SRC}
            alt="VPN Friends"
            width={48}
            height={48}
            className="w-6 h-6 flex-shrink-0 rounded object-contain"
          />
          <span className="text-xl font-bold">VPN Friends</span>
        </div>
        <p className="text-gray-500 text-sm text-center md:text-left max-w-xs">
          Безопасный и анонимный доступ к сети для всех ваших устройств.
        </p>
      </div>

      <div className="flex flex-col items-center md:items-end space-y-3">
        <h4 className="text-white font-medium mb-1">
          Юридическая информация
        </h4>
        <a
          href="#terms"
          className="text-sm text-gray-400 hover:text-brandGreen transition-colors"
        >
          Пользовательское соглашение
        </a>
        <a
          href="#privacy"
          className="text-sm text-gray-400 hover:text-brandGreen transition-colors"
        >
          Политика обработки данных
        </a>
        <a
          href="#refund"
          className="text-sm text-gray-400 hover:text-brandGreen transition-colors"
        >
          Условия возврата средств
        </a>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-panelBorder text-center">
      <p className="text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} VPN Friends. Все права защищены.
      </p>
    </div>
  </footer>
);
