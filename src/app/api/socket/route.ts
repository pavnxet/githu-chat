import { Server } from "socket.io";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { randomUUID } from "crypto";
import { desc } from "drizzle-orm";

export async function POST(req: Request) {
  // @ts-ignore - Vercel specific field
  const { socket } = await req.json();
  if (!socket) return new Response("No socket", { status: 400 });

  const io = new Server({
    path: "/api/socket",
    addTrailingSlash: false,
  });

  io.on("connection", (sock) => {
    console.log("Client connected", sock.id);

    // Send recent messages on connect
    db.select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(50)
      .then((recent) => {
        sock.emit("recent-messages", recent.reverse());
      });

    // Handle sending a message
    sock.on("send-message", async (data) => {
      const { username, encryptedContent, iv } = data;
      if (!username || !encryptedContent || !iv) return;

      const newMessage = {
        id: randomUUID(),
        username,
        encryptedContent,
        iv,
        createdAt: new Date().toISOString(),
      };

      await db.insert(messages).values(newMessage);
      io.emit("new-message", newMessage);
    });

    // Typing indicator
    sock.on("typing", (data) => {
      sock.broadcast.emit("user-typing", { username: data.username });
    });

    // Update last seen
    sock.on("user-active", async (data) => {
      await db
        .insert(users)
        .values({ username: data.username, lastSeen: new Date().toISOString() })
        .onConflictDoUpdate({
          target: users.username,
          set: { lastSeen: new Date().toISOString() },
        });
    });

    sock.on("disconnect", () => {
      console.log("Client disconnected", sock.id);
    });
  });

  // @ts-ignore - Vercel adapter
  return new Response(io.handleRequest(socket), {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function GET() {
  return new Response("Socket endpoint", { status: 200 });
}
