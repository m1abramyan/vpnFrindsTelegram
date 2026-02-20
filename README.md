# VPN Project — Telegram Mini App

Telegram Mini App для управления VPN-подписками. Интеграция с Marzban VPN Panel и платёжной системой Lava.ru.

## Стек

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM (SQLite)
- **VPN**: Marzban API
- **Платежи**: Lava.ru API

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env
# Заполните .env своими значениями

# Инициализация базы данных
npx prisma migrate dev

# Запуск в режиме разработки
npm run dev
```

## Переменные окружения

| Переменная | Описание |
|---|---|
| `MARZBAN_ADDRESS` | URL Marzban панели |
| `MARZBAN_USERNAME` | Логин админа Marzban |
| `MARZBAN_PASSWORD` | Пароль админа Marzban |
| `BOT_TOKEN` | Токен Telegram бота |
| `LAVA_SECRET_KEY` | Секретный ключ Lava.ru (для подписи запросов) |
| `LAVA_SECRET_KEY_2` | Второй секретный ключ Lava.ru (для верификации вебхуков) |
| `LAVA_SHOP_ID` | ID проекта в Lava.ru |
| `DATABASE_URL` | URL базы данных (по умолчанию `file:./dev.db`) |
| `SUBSCRIPTION_PRICE` | Цена подписки на 30 дней (в рублях) |
| `NEXT_PUBLIC_APP_URL` | URL приложения (для вебхуков и редиректов) |

## Структура проекта

```
src/
  app/
    api/
      auth/           — авторизация через Telegram initData
      user/status/    — получение статуса VPN и баланса
      billing/topup/  — создание платежа через Lava.ru
      billing/subscribe/ — покупка подписки
      webhooks/lava/  — вебхук для подтверждения оплаты
  components/         — UI компоненты (Dashboard, карточки, диалоги)
  lib/                — серверные сервисы (Marzban, Lava, Auth, Prisma)
prisma/               — схема БД и миграции
```
