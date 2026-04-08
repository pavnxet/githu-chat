import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ ping: "ok" });
  } catch (error) {
    console.error("Keepalive cron error:", error);
    return NextResponse.json({ error: "Keepalive failed" }, { status: 500 });
  }
}
