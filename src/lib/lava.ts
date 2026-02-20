import { createHmac, createHash, timingSafeEqual } from "crypto";

const LAVA_SECRET_KEY = process.env.LAVA_SECRET_KEY!;
const LAVA_SECRET_KEY_2 = process.env.LAVA_SECRET_KEY_2!;
const LAVA_SHOP_ID = process.env.LAVA_SHOP_ID!;

const LAVA_API_URL = "https://api.lava.ru/business/invoice/create";

function signRequest(body: Record<string, unknown>): string {
  const json = JSON.stringify(body);
  return createHmac("sha256", LAVA_SECRET_KEY).update(json).digest("hex");
}

export interface LavaInvoiceResponse {
  id: string;
  url: string;
  status: string;
  amount: number;
}

export async function createLavaInvoice(
  orderId: string,
  amount: number,
  hookUrl: string,
  successUrl: string
): Promise<LavaInvoiceResponse> {
  const body = {
    sum: amount,
    orderId,
    shopId: LAVA_SHOP_ID,
    hookUrl,
    successUrl,
    expire: 300,
    comment: "VPN Project - Пополнение баланса",
  };

  const signature = signRequest(body);

  const res = await fetch(LAVA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Signature: signature,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lava create invoice failed: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.data;
}

export function verifyWebhookSign(
  invoiceId: string,
  amount: string,
  payTime: string,
  sign: string
): boolean {
  const str = `${invoiceId}:${amount}:${payTime}:${LAVA_SECRET_KEY_2}`;
  const computed = createHash("md5").update(str).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(sign, "hex")
    );
  } catch {
    return false;
  }
}
