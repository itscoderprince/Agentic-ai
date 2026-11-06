# Agentic AI

A modern, full-stack platform for AI agent chat, autonomous workflows, and interactive tool assistance.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand, Base UI / Shadcn, Lucide React, Firebase Client SDK.
- **Backend**: Express 5, Node.js (ESM), Firebase Admin SDK, MongoDB (Mongoose), Redis (ioredis), Docker Compose.
- **Architecture**: Microservices with an API Gateway proxy.

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── docker-compose.yml       # Local Redis container
│   ├── services/
│   │   ├── gateway/             # API Gateway (Port 1000)
│   │   ├── auth/                # Auth Service (Port 2000)
│   │   ├── chat/                # Chat & Message Service (Port 3000)
│   │   └── agent/               # LangGraph Multi-Agent Service (Port 4000)
│   └── shared/
│       └── redis/               # Shared Redis connection module
├── frontend/                    # Vite + React 19 Frontend (Port 5173)
│   ├── components/              # UI components & Sidebar navigation
│   ├── pages/                   # Application views (ChatPage)
│   ├── store/                   # Zustand stores (useAuthStore)
│   └── utils/                   # Firebase & Axios setup
├── .agents/                     # Rules for AI coding assistants
├── AGENTS.md                    # Universal AI agent instructions
├── ARCHITECTURE.md              # Detailed system architecture & diagrams
└── GEMINI.md                    # Antigravity/Gemini workspace rules
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Docker & Docker Compose (for local Redis)
- MongoDB Atlas database or local MongoDB instance
- Firebase Project (Authentication with Google Provider enabled)

---

### Step 1: Start Redis
```bash
cd backend
docker-compose up -d
```

### Step 2: Configure Environment Variables

#### Frontend (`frontend/.env`)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_SERVER_URL=http://localhost:1000
```

#### Gateway (`backend/services/gateway/.env`)
```env
PORT=1000
AUTH_SERVICE=http://localhost:2000
CHAT_SERVICE=http://localhost:3000
AGENT_SERVICE=http://localhost:4000
REDIS_URL=redis://localhost:6379
```

#### Auth Service (`backend/services/auth/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
PORT=2000
NODE_ENV=development
SESSION_EXPIRY=604800000
REDIS_URL=redis://localhost:6379
```

#### Chat Service (`backend/services/chat/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
SESSION_EXPIRY=604800000
```

#### Agent Service (`backend/services/agent/.env`)
```env
PORT=4000
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```
*Note: Ensure `backend/services/auth/serviceAccountKey.json` contains your Firebase Admin SDK service account key.*

---

### Step 3: Run All Services

#### Option A: Unified Terminal Runner (Recommended)
Run all 5 microservices + frontend in a single terminal with color-coded live logs:
```bash
npm run dev
# Or: node start.js
```
*(Press `Ctrl + C` at any time to safely shut down all services at once).*

#### Option B: Separate Windows (Windows Launcher)
Double-click `start-all.bat` or run:
```cmd
start-all.bat
```
*(To stop all services and free up ports, run `stop-all.bat`).*

---

## 📖 Documentation
- [Backend Learning Masterclass Guide](BACKEND_LEARNING_GUIDE.md)
- [System Architecture](ARCHITECTURE.md)
- [Agent & IDE Guidelines](AGENTS.md)

