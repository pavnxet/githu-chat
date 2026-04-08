import { db } from "@/db";
import { messages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const recent = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(50);
    return NextResponse.json(recent.reverse());
  } catch (error) {
    console.error("GET /api/messages/recent error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
