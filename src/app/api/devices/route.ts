import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMarzbanUser, getMarzbanUser, deleteMarzbanUser } from "@/lib/marzban";


const MAX_DEVICES = 5;
const TRIAL_DAYS = 3;

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devices = await prisma.device.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const devicesWithStatus = await Promise.all(
      devices.map(async (device, index) => {
        let marzbanStatus = "unknown";
        let usedTraffic = 0;
        let links: string[] = [];

        try {
          const marzbanUser = await getMarzbanUser(device.marzbanUsername);
          if (marzbanUser) {
            marzbanStatus = marzbanUser.status;
            usedTraffic = marzbanUser.used_traffic;
            links = marzbanUser.links;
          }
        } catch {
          // Marzban unavailable
        }

        const isActive =
          device.subscriptionUntil && new Date(device.subscriptionUntil) > new Date();

        return {
          id: device.id,
          name: device.name || `Устройство ${index + 1}`,
          marzbanUsername: device.marzbanUsername,
          vlessLink: device.vlessLink,
          planId: device.planId,
          subscriptionUntil: device.subscriptionUntil,
          trialUsed: device.trialUsed,
          isActive,
          marzbanStatus,
          usedTraffic,
          links,
          createdAt: device.createdAt,
        };
      })
    );

    return NextResponse.json({
      devices: devicesWithStatus,
      maxDevices: MAX_DEVICES,
      canAdd: devices.length < MAX_DEVICES,
    });
  } catch (error) {
    console.error("Devices GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const VALID_PLANS: Record<string, { price: number; days: number }> = {
  "1month": { price: 99, days: 30 },
  "2months": { price: 169, days: 60 },
  "3months": { price: 249, days: 90 },
};

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deviceCount = await prisma.device.count({
      where: { userId: user.id },
    });

    if (deviceCount >= MAX_DEVICES) {
      return NextResponse.json(
        { error: `Максимум ${MAX_DEVICES} устройств` },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const deviceName = body.name || `Устройство ${deviceCount + 1}`;
    const marzbanUsername = `user${user.telegramId}_${deviceCount + 1}`;

    const grantTrial = !user.trialUsed;

    if (!grantTrial) {
      const planId = body.planId as string | undefined;
      if (!planId) {
        return NextResponse.json(
          { error: "Выберите тариф для создания устройства" },
          { status: 400 }
        );
      }

      const plan = VALID_PLANS[planId];
      if (!plan) {
        return NextResponse.json({ error: "Неверный тариф" }, { status: 400 });
      }

      const freshUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
      if (freshUser.balance < plan.price) {
        return NextResponse.json(
          { error: "Недостаточно средств", required: plan.price, current: freshUser.balance },
          { status: 400 }
        );
      }

      const expireSec = Math.floor(Date.now() / 1000) + plan.days * 24 * 60 * 60;
      const expireDate = new Date(expireSec * 1000);

      let marzbanUser;
      try {
        marzbanUser = await createMarzbanUser(marzbanUsername, {
          expire: expireSec,
          status: "active",
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Marzban create device error:", message);
        return NextResponse.json(
          { error: "VPN-сервер недоступен. Попробуйте позже.", details: message },
          { status: 502 }
        );
      }

      const vless = marzbanUser.links?.find((l: string) => l.startsWith("vless://"));
      const vlessLink = vless || marzbanUser.links?.[0] || null;

      const device = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { decrement: plan.price } },
        });

        return tx.device.create({
          data: {
            userId: user.id,
            name: deviceName,
            marzbanUsername,
            vlessLink,
            subscriptionUntil: expireDate,
            planId,
            trialUsed: false,
          },
        });
      });

      const updatedUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

      return NextResponse.json({
        id: device.id,
        name: device.name,
        marzbanUsername: device.marzbanUsername,
        vlessLink: device.vlessLink,
        subscriptionUntil: device.subscriptionUntil,
        trialDays: 0,
        balance: updatedUser.balance,
        price: plan.price,
        days: plan.days,
      });
    }

    const trialExpireSec = Math.floor(Date.now() / 1000) + TRIAL_DAYS * 24 * 60 * 60;
    const trialExpireDate = new Date(trialExpireSec * 1000);

    let marzbanUser;
    try {
      marzbanUser = await createMarzbanUser(marzbanUsername, {
        expire: trialExpireSec,
        status: "active",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Marzban create device error:", message);
      return NextResponse.json(
        { error: "VPN-сервер недоступен. Попробуйте позже.", details: message },
        { status: 502 }
      );
    }

    const vless = marzbanUser.links?.find((l: string) => l.startsWith("vless://"));
    const vlessLink = vless || marzbanUser.links?.[0] || null;

    const device = await prisma.device.create({
      data: {
        userId: user.id,
        name: deviceName,
        marzbanUsername,
        vlessLink,
        subscriptionUntil: trialExpireDate,
        trialUsed: true,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { trialUsed: true },
    });

    return NextResponse.json({
      id: device.id,
      name: device.name,
      marzbanUsername: device.marzbanUsername,
      vlessLink: device.vlessLink,
      subscriptionUntil: device.subscriptionUntil,
      trialDays: TRIAL_DAYS,
    });
  } catch (error) {
    console.error("Devices POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("id");

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID required" }, { status: 400 });
    }

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId: user.id },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    let remainingDays = 0;
    let remainingUntil: string | null = null;
    if (device.subscriptionUntil && new Date(device.subscriptionUntil) > new Date()) {
      remainingDays = Math.max(0, Math.ceil(
        (new Date(device.subscriptionUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ));
      remainingUntil = device.subscriptionUntil.toISOString();
    }

    try {
      await deleteMarzbanUser(device.marzbanUsername);
    } catch (err) {
      console.error("Marzban delete error:", err);
    }

    await prisma.device.delete({ where: { id: deviceId } });

    const response: Record<string, unknown> = { success: true };

    if (device.trialUsed) {
      response.remainingDays = remainingDays;
      response.remainingUntil = remainingUntil;
      response.trialMessage = "Пробный период доступен только один раз и больше не будет предоставлен для этого аккаунта.";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Devices DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
