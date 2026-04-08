# 🔐 Secure Chatroom

A public, real‑time chat application with **client‑side AES‑256‑GCM encryption**, 7‑day message retention, and automatic database keep‑alive. Deployable on Vercel with TursoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

---

## ✨ Features

- **End‑to‑End Encryption (Client‑Side)** – Messages are encrypted using AES‑256‑GCM in the browser before being sent to the server. The server never sees plaintext.
- **Real‑Time Messaging** – WebSocket (Socket.IO) delivers messages instantly to all connected users.
- **7‑Day Message Expiry** – Messages older than 7 days are automatically purged via a Vercel Cron Job.
- **Database Keep‑Alive** – A separate cron job pings the database every 5 minutes to prevent Turso's hibernation.
- **Unique Usernames** – Each user chooses a username; it also serves as the encryption key.
- **Online Presence & Typing Indicators** – See who is currently typing.
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
| Real‑Time        | Socket.IO + `@socket.io/vercel`     |
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

4. Copy `.env.local.example` to `.env.local` and fill in the values:
   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Add a Notification Sound (Optional)

Place a short MP3 file named `notification.mp3` in the `public/` directory.

---

## 📁 Project Structure

```
.
├── public/
│   └── notification.mp3          # Sound for new messages
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   │   ├── cleanup/      # 7‑day message deletion
│   │   │   │   └── keepalive/    # DB ping to prevent hibernation
│   │   │   ├── messages/         # Store encrypted message
│   │   │   ├── messages/recent/  # Fetch last 50 messages
│   │   │   └── socket/           # WebSocket server (Socket.IO)
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
│   └── lib/
│       └── encryption.ts         # AES‑GCM crypto functions
├── .env.local.example
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
   The IV and ciphertext are Base64‑encoded and sent to the server together with the username.

4. **Decryption**  
   Other clients receive the message, derive the same key from the sender's username, and decrypt using the provided IV.

Because the server never sees the plaintext or the key, even a database breach would only expose encrypted blobs.

---

## ⏰ Scheduled Tasks (Vercel Cron Jobs)

| Job        | Schedule        | Purpose                                                                 |
|------------|-----------------|-------------------------------------------------------------------------|
| Cleanup    | Daily at 00:00  | Deletes all messages older than 7 days.                                  |
| Keep‑Alive | Every 5 minutes | Executes `SELECT 1` to prevent the Turso database from hibernating.      |

Configuration is in `vercel.json`. These jobs run automatically after deployment to Vercel.

---

## 🌐 Deployment to Vercel

1. Push your code to a GitHub repository.

2. Import the project into Vercel.

3. Add the environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`

4. Deploy.

The cron jobs will begin running as soon as the production deployment is live.

---

## 🧪 Testing Locally

You can test the cron jobs locally using `vercel dev`:

```bash
npm install -g vercel
vercel dev
```

Then visit:
- `http://localhost:3000/api/cron/cleanup`
- `http://localhost:3000/api/cron/keepalive`

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Turso](https://turso.tech/)
- [Socket.IO](https://socket.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

**Enjoy secure, ephemeral chatting!** 🔏
