# 🖥️ Frontend — Agentic AI

> **Port**: `5173`  
> **Framework**: React 19 + Vite 8 + Tailwind CSS v4 + Base UI / Shadcn UI + Zustand  
> **Role**: Modern, responsive AI agent chat workspace with optimistic UI updates and instant session hydration.

---

## 1. Visual Component Architecture

```mermaid
flowchart TD
    classDef root fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff;
    classDef page fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#e2e8f0;
    classDef comp fill:#134e4a,stroke:#14b8a6,stroke-width:1.5px,color:#ccfbf1;
    classDef store fill:#3b0764,stroke:#a855f7,stroke-width:2px,color:#f3e8ff;

    ROOT["App.jsx<br/><i>(Hydrates session via useAuthStore)</i>"]:::root

    LOGIN["GoogleLoginCard.jsx<br/><i>(Shown if unauthenticated)</i>"]:::comp
    PAGE["ChatPage.jsx<br/><i>(Shown if authenticated)</i>"]:::page

    ROOT -->|user == null| LOGIN
    ROOT -->|user != null| PAGE

    subgraph ChatLayout ["ChatPage Workspace Layout"]
        direction TB
        SIDEBAR["AppSidebar.jsx<br/>• Brand Logo<br/>• Search (⌘K)<br/>• New Chat Button"]:::comp
        HEADER["ChatHeader<br/>• Collapsed Sidebar Capsule<br/>• Active Chat Title<br/>• Share Button"]:::comp
        CHATS["NavChats.jsx<br/>• List with activeId highlight<br/>• MessageDropdown (Pin/Rename/Delete)"]:::comp
        USER["NavUser.jsx<br/>• User Profile & Avatar<br/>• Dark Mode Toggle<br/>• Sign Out"]:::comp
        SEARCH["SearchDialog.jsx<br/>• Command Palette (⌘K)<br/>• Search Conversations"]:::comp

        SIDEBAR --> CHATS
        SIDEBAR --> USER
        PAGE --> SIDEBAR
        PAGE --> HEADER
        PAGE --> SEARCH
    end

    subgraph Stores ["Zustand State Stores"]
        AUTH_STORE["useAuthStore.js<br/>• user, isLoading<br/>• checkAuth(), loginWithGoogle(), logout()"]:::store
        CHAT_STORE["useChatStore.js<br/>• chats, activeId, isLoading<br/>• fetchChats(), newChat(), selectChat()<br/>• pinChat(), renameChat(), deleteChat()"]:::store
        THEME_STORE["useThemeStore.js<br/>• theme: 'dark' | 'light'<br/>• toggleTheme()"]:::store
    end

    PAGE -.-> CHAT_STORE
    CHATS -.-> CHAT_STORE
    USER -.-> AUTH_STORE
    USER -.-> THEME_STORE
```

---

## 2. Directory Layout

```
frontend/
├── components/
│   ├── ui/                    # Primitive Shadcn / Base UI controls (button, dialog, avatar, sidebar, etc.)
│   ├── app-sidebar.jsx        # Navigation sidebar with brand header and chat lists
│   ├── message-dropdown.jsx   # Context menu for chat actions (Pin, Rename, Delete)
│   ├── nav-chats.jsx          # Conversation list with activeId highlight & pin icons
│   ├── nav-user.jsx           # User profile menu, dark mode toggle, sign out
│   └── search-dialog.jsx      # Command Palette (⌘K) to quickly search and switch chats
├── hooks/
│   ├── use-mobile.js          # useSyncExternalStore responsive viewport detector
│   └── use-highlighted-code.js# Shiki syntax highlighting hook
├── lib/
│   ├── highlighter.jsx        # Shiki core code highlighter
│   └── utils.js               # Tailwind cn helper
├── pages/
│   └── ChatPage.jsx           # Main chat workspace & collapsible sidebar layout
├── store/
│   ├── useAuthStore.js        # User session, Google OAuth & logout
│   ├── useChatStore.js        # Conversations, activeId pointer & optimistic updates
│   └── useThemeStore.js       # Light / Dark theme management
├── utils/
│   ├── axios.js               # Pre-configured Axios instance withCredentials: true (Gateway Port 1000)
│   └── firebase.js            # Firebase client SDK initialization & Google Provider
├── src/
│   ├── App.jsx                # Root router / session gatekeeper
│   ├── main.jsx               # React 19 root
│   └── index.css              # Tailwind CSS v4 variables & typography
├── index.html                 # HTML shell with Geist font
└── vite.config.js             # Vite 8 configuration
```

---

## 3. Global State Architecture (Zustand)

For a complete in-depth guide on state management, see [`STATE_MANAGEMENT_GUIDE.md`](../STATE_MANAGEMENT_GUIDE.md).

### A. `useAuthStore` (Session & Authentication)
* **Session Hydration**: On app startup, `checkAuth()` calls `GET /auth/me`. The API Gateway checks the Redis session in `< 1ms` and hydrates `user`.
* **Google OAuth**: `loginWithGoogle()` triggers Firebase `signInWithPopup`, obtains an ID token, and sends it to `POST /auth/login`.
* **Clean Pattern**: Uses native `finally` to ensure `isLoading: false` is never duplicated.

### B. `useChatStore` (Conversations & Active Selection)
* **The `activeId` Pointer**: Tracks the currently open conversation. Multiple components (`NavChats`, `ChatHeader`, `SearchDialog`) subscribe atomically to `activeId`.
* **Instant Optimistic Updates**:
  - `pinChat(id)`: Flips the pin status in UI immediately, then syncs with `PATCH /chat/conversations/:id`. Reverts via `.catch()` on error.
  - `deleteChat(id)`: Removes chat immediately and jumps `activeId` to the next chat. Reverts via `.catch()` on network failure.
  - `renameChat(id, title)`: Renames title instantly in local state and syncs in background.

---

## 4. Engineering Principles Applied

1. **Atomic Selectors**: Always select specific slices (`const user = useAuthStore(s => s.user)`) to prevent unnecessary component re-renders.
2. **Shadcn UI First**: Reusable primitives from `components/ui/` (`Button`, `DropdownMenu`, `Avatar`, `Sidebar`, `Dialog`) instead of ad-hoc HTML.
3. **No Premature Abstractions**: We avoid complex wrapper classes. State actions use native JavaScript `try ... finally` and promise `.catch()` rollbacks.
4. **Modern React 19**: Viewport listening uses `useSyncExternalStore` instead of `useEffect` with synchronous `setState`.

---

## 5. Development & Running

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Run development server (Port 5173)
npm run dev

# 3. Run ESLint check
npm run lint

# 4. Create production build
npm run build
```
