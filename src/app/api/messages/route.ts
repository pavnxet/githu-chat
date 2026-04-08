import { db } from "@/db";
import { messages } from "@/db/schema";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, encryptedContent, iv } = await req.json();
    if (!username || !encryptedContent || !iv) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await db.insert(messages).values({
      id: randomUUID(),
      username,
      encryptedContent,
      iv,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
