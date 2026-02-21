import { Bot, InlineKeyboard } from "grammy";
import "dotenv/config";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN is not set in environment variables");
}

const bot = new Bot(token);

const WELCOME_TEXT = `Добро пожаловать в Friends VPN! 🛡

Быстрый, надёжный и безопасный VPN для всех устройств.

📱 Скачайте VPN-клиент для вашего устройства:

• iOS — Streisand
  https://apps.apple.com/am/app/streisand/id6450534064

• macOS — Streisand
  https://apps.apple.com/am/app/streisand/id6450534064

• Android — v2rayNG
  https://play.google.com/store/apps/details?id=com.v2ray.ang

• Windows — Hiddify
  https://github.com/hiddify/hiddify-app/releases

После установки клиента откройте личный кабинет, создайте устройство и скопируйте VLESS-ссылку в приложение.`;

const keyboard = new InlineKeyboard().webApp(
  "🔑 Открыть личный кабинет",
  "https://frendik.ru",
);

const lastWelcome = new Map<number, number>();

bot.command("start", async (ctx) => {
  const chatId = ctx.chat.id;
  const prev = lastWelcome.get(chatId);
  if (prev) {
    await ctx.api.deleteMessage(chatId, prev).catch(() => {});
  }
  const msg = await ctx.reply(WELCOME_TEXT, { reply_markup: keyboard });
  lastWelcome.set(chatId, msg.message_id);
});

bot.start();
console.log("Bot started");
