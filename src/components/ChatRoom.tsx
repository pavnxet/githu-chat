"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { UsernameModal } from "./UsernameModal";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useEncryption } from "@/hooks/useEncryption";
import { useSound } from "@/hooks/useSound";

interface RawMessage {
  id: string;
  username: string;
  encryptedContent: string;
  iv: string;
  createdAt: string;
}

interface DecryptedMessage extends RawMessage {
  decrypted?: string;
}

export function ChatRoom() {
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const { encrypt, decrypt, isReady } = useEncryption(username || "");
  const { play: playNotification, muted, toggleMute } = useSound("/notification.mp3");

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setDarkMode(saved === "true");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Initialize socket
  useEffect(() => {
    if (!username) return;

    const newSocket = io({
      path: "/api/socket",
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("recent-messages", async (rawMessages: RawMessage[]) => {
      const decrypted = await Promise.all(
        rawMessages.map(async (msg) => {
          try {
            const decrypted = await decrypt(msg.encryptedContent, msg.iv);
            return { ...msg, decrypted };
          } catch {
            return { ...msg, decrypted: "[Decryption failed]" };
          }
        })
      );
      setMessages(decrypted);
    });

    newSocket.on("new-message", async (msg: RawMessage) => {
      if (msg.username !== username) {
        playNotification();
      }
      try {
        const decrypted = await decrypt(msg.encryptedContent, msg.iv);
        setMessages((prev) => [...prev, { ...msg, decrypted }]);
      } catch {
        setMessages((prev) => [...prev, { ...msg, decrypted: "[Decryption failed]" }]);
      }
    });

    newSocket.on("user-typing", (data: { username: string }) => {
      if (data.username !== username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
        // Auto-remove after 2 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== data.username));
        }, 2000);
      }
    });

    setSocket(newSocket);

    // Send user-active every 30 seconds
    const interval = setInterval(() => {
      if (username) {
        newSocket.emit("user-active", { username });
      }
    }, 30000);
    newSocket.emit("user-active", { username });

    return () => {
      clearInterval(interval);
      newSocket.close();
    };
  }, [username, decrypt, playNotification]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!socket || !username || !isReady) return;

      try {
        const { ciphertext, iv } = await encrypt(text);
        socket.emit("send-message", {
          username,
          encryptedContent: ciphertext,
          iv,
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [socket, username, isReady, encrypt]
  );

  const handleTyping = useCallback(() => {
    if (socket && username) {
      socket.emit("typing", { username });
    }
  }, [socket, username]);

  if (!username) {
    return <UsernameModal onSetUsername={setUsername} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          🔐 Secure Chatroom
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            👤 {username}
          </span>
          <button
            onClick={toggleMute}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔔"}
          </button>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <MessageList messages={messages} currentUsername={username} />
      <TypingIndicator typingUsers={typingUsers} />
      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!isReady}
      />
    </div>
  );
}
