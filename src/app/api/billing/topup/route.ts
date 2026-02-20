import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { createLavaInvoice } from "@/lib/lava";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount < 10 || amount > 100000) {
      return NextResponse.json(
        { error: "Amount must be between 10 and 100000" },
        { status: 400 }
      );
    }

    const orderId = randomUUID();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";
    const hookUrl = `${appUrl}/api/webhooks/lava`;
    const successUrl = `${appUrl}/payment/success`;

    const invoice = await createLavaInvoice(
      orderId,
      amount,
      hookUrl,
      successUrl
    );

    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        orderId,
        lavaId: invoice.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: invoice.url, orderId });
  } catch (error) {
    console.error("Topup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
