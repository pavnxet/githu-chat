import { db } from "@/db";
import { messages } from "@/db/schema";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { pusherServerClient } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const { username, encryptedContent, iv } = await req.json();
    if (!username || !encryptedContent || !iv) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newMessage = {
      id: randomUUID(),
      username,
      encryptedContent,
      iv,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to the database
    await db.insert(messages).values(newMessage);

    // 2. Broadcast to all connected clients via Pusher
    await pusherServerClient.trigger('chatroom', 'new-message', newMessage);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
