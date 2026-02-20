import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { updateMarzbanUser, getMarzbanUser } from "@/lib/marzban";
import { prisma } from "@/lib/prisma";

const VALID_PLANS: Record<string, { price: number; days: number }> = {
  "1month": { price: 199, days: 30 },
  "3months": { price: 449, days: 90 },
  "1year": { price: 1499, days: 365 },
};

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId, planId } = body as { deviceId: string; planId: string };

    if (!deviceId || !planId) {
      return NextResponse.json(
        { error: "deviceId and planId are required" },
        { status: 400 }
      );
    }

    const plan = VALID_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId: user.id },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    if (user.balance < plan.price) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: plan.price,
          current: user.balance,
        },
        { status: 400 }
      );
    }

    const durationSec = plan.days * 24 * 60 * 60;
    const nowSec = Math.floor(Date.now() / 1000);

    let marzbanExpire = nowSec;
    try {
      const marzbanUser = await getMarzbanUser(device.marzbanUsername);
      if (marzbanUser?.expire && marzbanUser.expire > nowSec) {
        marzbanExpire = marzbanUser.expire;
      }
    } catch {
      // Use current time as base
    }

    const newExpire = marzbanExpire + durationSec;
    const newExpireDate = new Date(newExpire * 1000);

    await prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
      });

      if (freshUser.balance < plan.price) {
        throw new Error("Insufficient balance");
      }

      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: plan.price } },
      });

      await tx.device.update({
        where: { id: deviceId },
        data: {
          subscriptionUntil: newExpireDate,
          planId,
        },
      });
    });

    try {
      await updateMarzbanUser(device.marzbanUsername, {
        expire: newExpire,
        status: "active",
      });
    } catch (err) {
      console.error("Marzban update failed:", err);
    }

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    return NextResponse.json({
      balance: updatedUser.balance,
      deviceId,
      subscriptionUntil: newExpireDate,
      price: plan.price,
      days: plan.days,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
