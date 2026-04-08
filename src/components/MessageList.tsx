"use client";

import { useEffect, useRef } from "react";

interface Message {
  id: string;
  username: string;
  encryptedContent: string;
  iv: string;
  createdAt: string;
  decrypted?: string;
}

interface Props {
  messages: Message[];
  currentUsername: string;
}

export function MessageList({ messages, currentUsername }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isOwn = msg.username === currentUsername;
        return (
          <div
            key={msg.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isOwn
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              <div className="text-xs opacity-75 mb-1">
                {msg.username} • {formatTime(msg.createdAt)}
              </div>
              <div className="break-words">
                {msg.decrypted || "🔒 [Encrypted]"}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
