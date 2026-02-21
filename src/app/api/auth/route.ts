import { NextResponse } from "next/server";
import { authenticateRequest, debugAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      const debug = debugAuth(request);
      return NextResponse.json({ error: "Unauthorized", debug }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      balance: user.balance,
      trialUsed: user.trialUsed,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
