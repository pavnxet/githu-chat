import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  encryptedContent: text("encrypted_content").notNull(),
  iv: text("iv").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const users = sqliteTable("users", {
  username: text("username").primaryKey(),
  lastSeen: text("last_seen").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
