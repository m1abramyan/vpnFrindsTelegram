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

    let marzbanUser;
    try {
      if (grantTrial) {
        const trialExpireSec = Math.floor(Date.now() / 1000) + TRIAL_DAYS * 24 * 60 * 60;
        marzbanUser = await createMarzbanUser(marzbanUsername, {
          expire: trialExpireSec,
          status: "active",
        });
      } else {
        marzbanUser = await createMarzbanUser(marzbanUsername, {
          expire: 0,
          status: "disabled",
        });
      }
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

    const trialExpireDate = grantTrial
      ? new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
      : null;

    const device = await prisma.device.create({
      data: {
        userId: user.id,
        name: deviceName,
        marzbanUsername,
        vlessLink,
        subscriptionUntil: trialExpireDate,
        trialUsed: grantTrial,
      },
    });

    if (grantTrial) {
      await prisma.user.update({
        where: { id: user.id },
        data: { trialUsed: true },
      });
    }

    return NextResponse.json({
      id: device.id,
      name: device.name,
      marzbanUsername: device.marzbanUsername,
      vlessLink: device.vlessLink,
      subscriptionUntil: device.subscriptionUntil,
      trialDays: grantTrial ? TRIAL_DAYS : 0,
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
