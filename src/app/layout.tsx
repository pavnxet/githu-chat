import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure Chatroom",
  description: "End-to-end encrypted public chatroom with 7-day message retention",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
