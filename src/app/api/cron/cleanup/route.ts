import { db } from "@/db";
import { messages } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.delete(messages).where(sql`created_at < datetime('now', '-7 days')`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cleanup cron error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
