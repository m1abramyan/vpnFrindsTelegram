import { validate, parse } from "@telegram-apps/init-data-node";
import { prisma } from "./prisma";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const DEV_TELEGRAM_ID = BigInt(123456789);

export interface AuthUser {
  id: string;
  telegramId: bigint;
  username: string | null;
  balance: number;
  trialUsed: boolean;
}

export function debugAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  return {
    hasHeader: !!authHeader,
    headerPrefix: authHeader?.slice(0, 20) ?? null,
    headerLength: authHeader?.length ?? 0,
    botTokenLength: BOT_TOKEN?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
  };
}

async function getOrCreateDevUser(): Promise<AuthUser> {
  let user = await prisma.user.findUnique({
    where: { telegramId: DEV_TELEGRAM_ID },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: DEV_TELEGRAM_ID,
        username: "dev_user",
        balance: 500,
      },
    });
  }

  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    balance: user.balance,
    trialUsed: user.trialUsed,
  };
}

export async function authenticateRequest(
  request: Request
): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("tma ")) return null;

  const initDataRaw = authHeader.slice(4);

  if (process.env.NODE_ENV === "development" && initDataRaw === "dev_mode") {
    return getOrCreateDevUser();
  }

  try {
    validate(initDataRaw, BOT_TOKEN, { expiresIn: 86400 });
  } catch (err) {
    console.error("initData validation failed:", err instanceof Error ? err.message : err);
    return null;
  }

  const parsed = parse(initDataRaw);
  const tgUser = parsed.user;
  if (!tgUser) return null;

  const telegramId = BigInt(tgUser.id);

  let user = await prisma.user.findUnique({
    where: { telegramId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        username: tgUser.username ?? null,
      },
    });
  } else if (tgUser.username && tgUser.username !== user.username) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { username: tgUser.username },
    });
  }

  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    balance: user.balance,
    trialUsed: user.trialUsed,
  };
}
