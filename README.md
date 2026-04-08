# 🔐 Secure Chatroom

A public, real‑time chat application with **client‑side AES‑256‑GCM encryption**, 7‑day message retention, and automatic database keep‑alive. Built with Next.js, TursoDB, and Pusher for robust real-time communication.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Pusher](https://img.shields.io/badge/Pusher-Enabled-orange)

---

## ✨ Features

- **End‑to‑End Encryption (Client‑Side)** – Messages are encrypted using AES‑256‑GCM in the browser before being sent to the server. The server never sees plaintext.
- **Real‑Time Messaging** – powered by **Pusher**, delivering messages instantly to all connected users without the need for complex socket server management.
- **7‑Day Message Expiry** – Messages older than 7 days are automatically purged via a Vercel Cron Job.
- **Database Keep‑Alive** – A separate cron job pings the database every 5 minutes to prevent Turso's hibernation.
- **Unique Usernames** – Each user chooses a username; it also serves as the encryption key.
- **Online Presence & Typing Indicators** – See who is currently typing in real-time.
- **Dark Mode** – Toggle between light and dark themes.
- **Sound Notifications** – Play a subtle sound when a new message arrives (with mute option).
- **Responsive UI** – Built with Tailwind CSS for mobile and desktop.

---

## 🛠 Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Framework        | Next.js 15 (App Router)             |
| Language         | TypeScript                          |
| Styling          | Tailwind CSS                        |
| Real‑Time        | Pusher (Serverless Friendly)        |
| Database         | Turso (libSQL)                      |
| ORM              | Drizzle ORM                         |
| Encryption       | Web Crypto API (AES‑GCM‑256)        |
| Scheduling       | Vercel Cron Jobs                    |
| Deployment       | Vercel                              |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Turso](https://turso.tech) account (free tier works)
- A [Pusher](https://pusher.com) account (free tier works)
- A [Vercel](https://vercel.com) account (optional, for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/secure-chatroom.git
cd secure-chatroom
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Turso Database

1. Install the Turso CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. Create a new database:
   ```bash
   turso db create chatroom
   ```

3. Get the connection URL and token:
   ```bash
   turso db show chatroom --url
   turso db tokens create chatroom
   ```

### 4. Set Up Pusher Channels

1. Log in to [Pusher](https://pusher.com).
2. Create a new "Channels" app.
3. Choose a cluster (e.g., `mt1`).
4. Copy your credentials from the "App Keys" tab.

### 5. Configure Environment Variables

Create or update `.env.local` with your credentials:

```bash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# Pusher configuration
PUSHER_APP_ID=your_pusher_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
```

### 6. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 7. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   │   ├── cleanup/      # 7‑day message deletion
│   │   │   │   └── keepalive/    # DB ping to prevent hibernation
│   │   │   ├── messages/         # Store and broadcast messages
│   │   │   ├── messages/recent/  # Fetch last 50 messages
│   │   │   └── pusher/auth/      # Pusher authentication endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ChatInput.tsx
│   │   ├── ChatRoom.tsx
│   │   ├── MessageList.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── UsernameModal.tsx
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   └── schema.ts             # Database tables
│   ├── hooks/
│   │   ├── useEncryption.ts
│   │   └── useSound.ts
│   ├── lib/
│   │   ├── encryption.ts         # AES‑GCM crypto functions
│   │   └── pusher.ts             # Pusher client initialization
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vercel.json                   # Cron job configuration
```

---

## 🔒 How Encryption Works

1. **Key Derivation**  
   The user's chosen username is fed into `PBKDF2` with a fixed salt and 10,000 iterations to produce a 256‑bit AES key.

2. **Encryption**  
   For each message, a random 12‑byte Initialization Vector (IV) is generated. The plaintext is encrypted using `AES‑GCM` with the derived key and IV.

3. **Transmission**  
   The IV and ciphertext are Base64‑encoded and sent to the server. The server then broadcasts this blob to other clients via Pusher.

4. **Decryption**  
   Other clients receive the message, derive the same key from the sender's username, and decrypt using the provided IV.

Because the server never sees the plaintext or the key, even a compromise of the database or Pusher would only expose encrypted blobs.

---

## ⏰ Scheduled Tasks (Vercel Cron Jobs)

| Job        | Schedule        | Purpose                                                                 |
|------------|-----------------|-------------------------------------------------------------------------|
| Cleanup    | Daily at 00:00  | Deletes all messages older than 7 days.                                  |
| Keep‑Alive | Every 5 minutes | Executes `SELECT 1` to prevent the Turso database from hibernating.      |

---

## 🌐 Deployment to Vercel

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the environment variables (`TURSO_...` and `PUSHER_...`).
4. Deploy.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Turso](https://turso.tech/)
- [Pusher](https://pusher.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

**Enjoy secure, ephemeral chatting!** 🔏
