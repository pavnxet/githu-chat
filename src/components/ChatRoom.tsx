"use client";

import { useState, useEffect, useCallback } from "react";
import Pusher from 'pusher-js';
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

  // Load recent messages and subscribe to Pusher events
  useEffect(() => {
    if (!username) return;

    // Load recent messages
    fetch('/api/messages/recent')
      .then(res => res.json())
      .then(async (data: RawMessage[]) => {
        const decrypted = await Promise.all(
          data.map(async (msg) => {
            try {
              const decrypted = await decrypt(msg.encryptedContent, msg.iv);
              return { ...msg, decrypted };
            } catch {
              return { ...msg, decrypted: "[Decryption failed]" };
            }
          })
        );
        setMessages(decrypted);
      })
      .catch(console.error);

    // Connect to Pusher
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.error('Pusher environment variables are missing. Real-time updates disabled.');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe('chatroom');
    
    channel.bind('new-message', async (msg: RawMessage) => {
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

    channel.bind('client-typing', (data: { username: string }) => {
      if (data.username !== username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== data.username));
        }, 2000);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [username, decrypt, playNotification]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!username || !isReady) return;

      try {
        const { ciphertext, iv } = await encrypt(text);
        
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            encryptedContent: ciphertext,
            iv,
          }),
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [username, isReady, encrypt]
  );

  const handleTyping = useCallback(() => {
    if (!username) return;
    
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const channel = pusher.subscribe('chatroom');
    channel.trigger('client-typing', { username });
    pusher.disconnect();
  }, [username]);

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
