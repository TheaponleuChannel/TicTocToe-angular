# ⬡ NEON GOMOKU — Angular 18

> Cross-device **5-in-a-row** Gomoku with a neon cyberpunk theme.  
> Built with **Angular 18 Signals · Lazy-loaded Routes · Socket.IO · Web Audio API**

---

## 🚀 Quick Start

```bash
npm install

# Development (hot reload — two terminals)
npm run server   # Terminal 1: Socket.IO on :3000
npm start        # Terminal 2: Angular on :4200

# Or run both at once
npm run dev

# Production preview (build → serve on :3000)
npm run preview
```

Open **http://localhost:4200** in dev mode, or **http://localhost:3000** after `npm run preview`.

---

## 📁 Full Angular Structure

```
neon-gomoku/
│
├── server.js                        ← Node.js + Socket.IO backend
├── proxy.conf.json                  ← Dev proxy: /socket.io → :3000
├── angular.json                     ← Build config + env file replacements
├── package.json
├── tsconfig.json / tsconfig.app.json
│
└── src/
    ├── main.ts                      ← bootstrapApplication() entry
    ├── index.html                   ← Shell HTML + Socket.IO script tag
    ├── styles.scss                  ← Global design tokens & shared utilities
    │
    ├── environments/
    │   ├── environment.ts           ← Dev: { production:false, gridStart:12, winLength:5 }
    │   └── environment.production.ts← Prod: swapped in at build time by angular.json
    │
    └── app/
        ├── app.component.ts         ← Root shell: <router-outlet> + layout singletons
        ├── app.component.scss
        ├── app.config.ts            ← provideRouter · provideAnimations · provideHttpClient
        ├── app.routes.ts            ← Lazy-loaded routes with canActivate guards
        │
        ├── models/
        │   └── game.models.ts       ← All TypeScript interfaces & types
        │
        ├── store/
        │   └── game.store.ts        ← Signal store (single source of truth)
        │                               Exposes: state · cells · gridSize · isMyTurn …
        │
        ├── services/
        │   ├── game.service.ts      ← Business logic: win detection · AI · board ops
        │   ├── socket.service.ts    ← Socket.IO client (create/join/move/rematch)
        │   ├── sound.service.ts     ← Web Audio API synth sounds
        │   └── toast.service.ts     ← Signal-based toast queue
        │
        ├── core/                    ← App-wide singletons (guards, interceptors, etc.)
        │   ├── guards/
        │   │   ├── auth.guard.ts        ← Requires nickname → redirects /auth
        │   │   ├── game-active.guard.ts ← Requires active session → redirects /menu
        │   │   └── room.guard.ts        ← Requires room code → redirects /lobby
        │   ├── interceptors/
        │   │   ├── logging.interceptor.ts  ← Dev HTTP logging
        │   │   └── error.interceptor.ts    ← Global HTTP error → toast
        │   ├── directives/
        │   │   ├── neon-hover.directive.ts ← Glow on hover (X or O colour)
        │   │   └── click-sound.directive.ts← UI click sound on any element
        │   └── pipes/
        │       ├── truncate.pipe.ts        ← Truncate string with ellipsis
        │       └── mark-color.pipe.ts      ← Mark → CSS var colour string
        │
        ├── shared/                  ← Reusable UI components & utilities
        │   ├── components/
        │   │   ├── button/          ← <app-button variant="primary|secondary|ghost|danger">
        │   │   ├── input/           ← <app-input> — ControlValueAccessor neon input
        │   │   ├── panel/           ← <app-panel title="" subtitle=""> glassmorphism card
        │   │   ├── badge/           ← <app-badge color="x|o|draw|dim"> pill badge
        │   │   └── modal/           ← <app-modal [visible]="" title="" (closed)=""> overlay
        │   ├── directives/
        │   │   ├── autofocus.directive.ts  ← Focus after view init
        │   │   └── ripple.directive.ts     ← Material ripple on click
        │   └── pipes/
        │       └── uppercase-mark.pipe.ts  ← Player name → uppercase truncated label
        │
        ├── layout/                  ← Persistent UI (always rendered, outside router)
        │   └── components/
        │       ├── toast/           ← Toast notifications (animated, Signal-driven)
        │       └── confetti/        ← Canvas confetti (fires via effect() on win)
        │
        └── features/                ← Lazy-loaded page components (1 per route)
            ├── loading/             ← /loading  — animated progress bar
            ├── menu/                ← /menu     — typewriter title + nav buttons
            ├── auth/                ← /auth     — nickname entry (guest login)
            ├── lobby/               ← /lobby    — create or join multiplayer room
            ├── waiting/             ← /waiting  — room code display + connection status
            ├── guide/               ← /guide    — full How to Play reference
            └── game/                ← /game     — main game screen
                └── components/      ← Game sub-components (not routed)
                    ├── board/           ← NxN grid, cell clicks, expansion animation
                    ├── scoreboard/      ← P1 / Draws / P2 score display
                    ├── turn-indicator/  ← Whose turn it is (+ MP connection status)
                    └── result-overlay/  ← Win/draw overlay with rematch/menu buttons
```

---

## 🏗️ Angular 18 Patterns Used

| Pattern | Where | Detail |
|---|---|---|
| **Signals** (`signal`, `computed`, `effect`) | `GameStore`, `ToastService`, components | All reactive state — no RxJS subscriptions needed |
| **Standalone components** | Every component | No NgModule anywhere in the codebase |
| **Lazy-loaded routes** | `app.routes.ts` | Each feature loads only when navigated to |
| **Functional guards** | `core/guards/` | `CanActivateFn` — no class-based guards |
| **Functional interceptors** | `core/interceptors/` | `HttpInterceptorFn` — registered in `app.config.ts` |
| **`inject()`** | All components/services | Functional DI — no constructor params needed |
| **`ChangeDetectionStrategy.OnPush`** | `BoardComponent` | Optimal perf for the hot-path grid render |
| **`TrackByFunction`** | Board cell loop | Prevents re-creating DOM nodes on each tick |
| **`withViewTransitions()`** | `app.config.ts` | Native browser view transitions between routes |
| **`withComponentInputBinding()`** | `app.config.ts` | Route params auto-bound to component inputs |
| **Environment files** | `environments/` | `environment.ts` swapped for `.production.ts` at build |

---

## 🎮 Gameplay

| Rule | Detail |
|---|---|
| Win condition | **5 in a row** — horizontal, vertical, or diagonal |
| Starting grid | **12×12** (144 cells) |
| Grid expansion | Doubles when full (12→24→48→96…), pieces preserved in center |
| Sounds | Web Audio API synthesis — place · win · draw · expand (no audio files) |
| AI | Heuristic threat scoring — wins, blocks, prefers center |
| Multiplayer | Real-time Socket.IO; grid expansion synced across devices |

---

## 🌐 Cross-Device Play

**LAN:** Run `npm run preview`, find your IP (`ipconfig` / `ifconfig`), share `http://IP:3000`

**Internet:** Deploy to [Render.com](https://render.com) or [Railway.app](https://railway.app):
- Build command: `npm install && npm run build`
- Start command: `node server.js`
