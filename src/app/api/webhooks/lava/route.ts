import { NextResponse } from "next/server";
import { verifyWebhookSign } from "@/lib/lava";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { invoice_id, order_id, status, amount, pay_time, sign } = body;

    if (status !== "success") {
      return NextResponse.json({ ok: true });
    }

    if (sign && !verifyWebhookSign(invoice_id, String(amount), String(pay_time), sign)) {
      console.error("Lava webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { orderId: order_id },
    });

    if (!transaction) {
      console.error("Lava webhook: transaction not found", order_id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ ok: true });
    }

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          lavaId: invoice_id,
        },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: {
          balance: { increment: transaction.amount },
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lava webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
