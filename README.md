# ⚡ ChatShit - Next-Gen Fullstack Mobile & Realtime Chat Application

A complete, production-ready, full-stack chat ecosystem:
- 📱 **Mobile App:** Built with React Native & Expo (iOS / Android) featuring an ultra-sleek **Neo-Dark Cyber Obsidian** design.
- 🚀 **Backend Server:** Modern, modular **Node.js Express + Socket.IO** real-time engine with persistent JSON database, media upload, and live web dashboard.
- 🐳 **Docker & Docker Compose:** Containerized deployment with volume persistence for chat history and photo uploads.
- 🔥 **Firebase Sync:** Optional Realtime Database & Cloud Storage REST sync.

---

## 🏗️ Architecture & Backend Structure

The backend is structured with clean MVC separation:

```text
server/
├── Dockerfile                  # Production Alpine container with healthchecks
├── .dockerignore               # Ignores local node_modules & uploads
├── package.json                # Express, Socket.IO, Multer, Cors, Dotenv
├── server.js                   # Server entrypoint with Socket.IO attachment
├── data/
│   ├── seed.json               # Initial pre-seeded users and squad chats
│   └── db.json                 # Persistent auto-saving database file
├── uploads/                    # Persistent storage for photo/media uploads
└── src/
    ├── app.js                  # Express middleware, static files, routes
    ├── config/index.js         # Environment config (ports, paths, auth)
    ├── controllers/            # Conversation, Message, User, Media controllers
    ├── middleware/             # Auth, error handling, file upload
    ├── models/store.js         # Thread-safe persistent in-memory database
    ├── routes/                 # Clean modular REST routes
    ├── sockets/chatSocket.js   # Real-time WebSocket rooms & typing indicators
    └── views/dashboard.html    # Interactive HTML API Dashboard
```

---

## 🐳 Quick Start with Docker (Recommended)

To run the backend inside Docker with persistent storage:

```bash
# 1. From the project root:
docker compose up --build
```

That's it! The backend will start on **`http://localhost:3000`**.

### What Docker sets up:
- **Port 3000:** Exposed to your local machine and LAN.
- **Volume Mounts (`./server/data` and `./server/uploads`):** Any new chats, messages, or uploaded photos survive container restarts!
- **Health Check:** Automatically verifies the server is responsive every 15s.

---

## 💻 Running Backend Without Docker (Node.js)

If you prefer running directly with Node:

```bash
cd server
npm install
npm start
# Or for live auto-reload during development:
npm run dev
```

---

## 📡 Active API Endpoints

Once running, visit **`http://localhost:3000`** in your browser to see the live **Interactive API Dashboard**!

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Live interactive HTML API Dashboard |
| `GET` | `/api/health` | Docker & container health check |
| `GET` | `/api/stats` | Live counts of chats, users, and messages |
| `GET` | `/conversation` | Get all active chats & squads |
| `POST` | `/conversation` | Create a new squad or DM (`{ type, name, participants_ids }`) |
| `GET` | `/user` | Get all available users |
| `GET` | `/user/profile?user_id=u1` | Get user details |
| `GET` | `/message?conversation_id=c1` | Get messages for a chat |
| `POST` | `/message` | Send message / image (`{ conversation_id, content, imageInfo }`) |
| `POST` | `/media/upload` | Multipart image upload |
| `GET` | `/uploads/:filename` | Serve uploaded media files |
| `WS` | `/socket.io` | Realtime messaging, rooms, and typing indicators |

---

## 📱 Connecting the Mobile App

1. Check your computer's local IP address (e.g. `192.168.1.X` or `10.X.X.X` using `ifconfig` or `ipconfig`).
2. Update `chat_app/config.js`:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';
   export const AUTH_HEADER = 'Basic first:second';
   ```
   *(If using Android Emulator, you can use `http://10.0.2.2:3000`. If using iOS Simulator, you can use `http://localhost:3000`)*.

3. Run the Expo mobile app:
   ```bash
   cd chat_app
   npx expo start
   ```

---

## 🔥 Optional Firebase Setup
See [chat_app/FIREBASE_SETUP.md](chat_app/FIREBASE_SETUP.md) if you want to sync messages to Firebase Cloud as well.
