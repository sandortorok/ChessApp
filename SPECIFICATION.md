# 📋 ChessApp - Teljes Műszaki Specifikáció

## 📖 Tartalomjegyzék
- [1. Projekt Áttekintés](#1-projekt-áttekintés)
- [2. Technológiai Stack](#2-technológiai-stack)
- [3. Architektúra](#3-architektúra)
- [4. Adatbázis Struktúra](#4-adatbázis-struktúra)
- [5. Funkcionális Követelmények](#5-funkcionális-követelmények)
- [6. Komponensek](#6-komponensek)
- [7. Service Layer](#7-service-layer)
- [8. Routing & Navigáció](#8-routing--navigáció)
- [9. Biztonsági Követelmények](#9-biztonsági-követelmények)
- [10. Deployment](#10-deployment)

---

## 1. Projekt Áttekintés

### 1.1 Projekt Neve
**ChessApp** - Valós idejű online sakk platform

### 1.2 Verzió
**v0.0.0** (fejlesztés alatt)

### 1.3 Cél
Egy modern, valós idejű, több játékos által használható online sakk alkalmazás fejlesztése, amely támogatja:
- Emberi játékosok közötti mérkőzéseket
- AI elleni játékot (Lichess API integráció)
- ELO rangsor rendszer
- Valós idejű chat
- Játéktörténet és visszajátszás
- Teljes körű felhasználó kezelés

### 1.4 Célközönség
- Sakk rajongók
- Amatőr és versenyzők
- Casual játékosok

---

## 2. Technológiai Stack

### 2.1 Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.7
- **Styling**: 
  - Tailwind CSS 4.1.14
  - Lucide React Icons
  - Heroicons
- **Routing**: React Router DOM 7.9.3
- **Chess Logic**: Chess.js 1.4.0
- **Chess UI**: React Chessboard 5.6.1
- **UI Components**: Headless UI 2.2.9

### 2.2 Backend & Services
- **BaaS**: Firebase (v12.3.0)
  - Authentication (Email/Password, Google, Anonymous/Guest)
  - Realtime Database (játék állapot tárolás)
  - Firestore (felhasználói profilok, statisztikák)
  - Storage (avatar képek)
  - Hosting (production deployment)
  - Functions (Node.js backend logika - jelenleg minimális)

### 2.3 Külső API-k
- **Lichess API**: 
  - AI ellenfél integrációhoz
  - Lichess Board API
  - Cloud Evaluation API

### 2.4 Development Tools
- **Linter**: ESLint 9.36.0
- **Type Checking**: TypeScript
- **Package Manager**: npm

---

## 3. Architektúra

### 3.1 Magas Szintű Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages         │  Components     │  Services                │
│  - Home        │  - ChessBoard   │  - gameService           │
│  - Lobby       │  - Header       │  - playerService         │
│  - Game        │  - PlayerInfo   │  - aiGameService         │
│  - MyGames     │  - Chat         │  - userService           │
│  - Leaderboard │  - Modals       │  - lichessService        │
│  - Settings    │  - Auth Forms   │                          │
└────────┬────────────────┬────────────────┬──────────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   Firebase      │ │   Firebase  │ │  Lichess API    │
│   Auth          │ │   Realtime  │ │  (AI Games)     │
│   (Users)       │ │   Database  │ │                 │
└─────────────────┘ │   (Games)   │ └─────────────────┘
                    └──────┬──────┘
┌─────────────────┐        │
│   Firestore     │◄───────┘
│   (Profiles,    │
│   Stats)        │
└─────────────────┘
┌─────────────────┐
│   Storage       │
│   (Avatars)     │
└─────────────────┘
```

### 3.2 Adatfolyam Architektúra

#### 3.2.1 Játék Létrehozás Flow
```
User Input (Lobby)
  → CreateGameModal (time, increment, opponent type)
  → gameService.createNewGame()
  → Firebase Realtime DB: /games/{gameId}
  → Navigate to /game/{gameId}
```

#### 3.2.2 Játék Csatlakozás Flow
```
User joins game
  → playerService.joinGame()
  → Fetch user data from Firestore
  → Update /games/{gameId}/players/{side}
  → Real-time listener updates UI
```

#### 3.2.3 Lépés Flow
```
User makes move
  → Chess.js validation
  → gameService.updateGameInDb()
  → Update Firebase Realtime DB
  → Time calculation & increment
  → Check game end conditions
  → updateFirestoreOnGameEnd() if needed
  → Real-time sync to all clients
```

### 3.3 State Management
- **Local State**: React useState, useRef
- **Global State**: Firebase Realtime listeners (real-time sync)
- **Auth State**: Firebase onAuthStateChanged
- **Custom Hooks**: 
  - `useAuth()` - Authentication state

---

## 4. Adatbázis Struktúra

### 4.1 Firebase Realtime Database

#### 4.1.1 Games Collection
```json
/games/{gameId}/
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "moves": [
    {
      "from": "e2",
      "to": "e4",
      "san": "e4",
      "fen": "...",
      "updatedAt": 1234567890,
      "moveNumber": 1,
      "timeLeft": { "white": 300000, "black": 300000 }
    }
  ],
  "lastMove": {
    "from": "e2",
    "to": "e4",
    "san": "e4"
  },
  "players": {
    "white": {
      "uid": "user123",
      "name": "Player Name",
      "displayName": "Player Name",
      "email": "player@example.com",
      "elo": 1200,
      "wins": 5,
      "losses": 3,
      "draws": 1
    },
    "black": { /* same structure */ }
  },
  "turn": "white",
  "status": "waiting" | "ongoing" | "ended",
  "winner": "white" | "black" | "draw" | null,
  "winReason": "checkmate" | "timeout" | "resignation" | ...,
  "timeLeft": { "white": 300000, "black": 300000 },
  "timeControl": 5,      // percben
  "increment": 0,        // másodpercben
  "opponentType": "human" | "ai",
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "started": false,
  "startingElo": { "white": 1200, "black": 1200 },
  "finalElo": { "white": 1215, "black": 1185 },
  "drawOfferedBy": "user123" | null,
  "lichessGameId": "abc123xyz" // Ha AI játék
}
```

### 4.2 Firestore Database

#### 4.2.1 Users Collection
```typescript
/users/{userId}/
{
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;        // vagy "emoji:👤" formátum
  elo: number;             // 1200 alapértelmezett
  wins: number;
  losses: number;
  draws: number;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  settings: {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    theme: string;
    // további beállítások
  }
}
```

#### 4.2.2 Chat Messages (opcionális - jelenleg nincs implementálva)
```typescript
/chats/{gameId}/messages/{messageId}/
{
  userId: string;
  userName: string;
  message: string;
  timestamp: Timestamp;
}
```

### 4.3 Firebase Storage
```
/avatars/{userId}/
  - profile.jpg
  - profile.png
```

---

## 5. Funkcionális Követelmények

### 5.1 Authentikáció & Felhasználó Kezelés

#### 5.1.1 Bejelentkezési Módok
- ✅ **Email/Password**: Hagyományos regisztráció és bejelentkezés
- ✅ **Google OAuth**: Azonnali bejelentkezés Google fiókkal
- ✅ **Guest/Anonymous**: Vendég belépés regisztráció nélkül
- ❌ **Facebook OAuth**: Előkészítve, de nem használt

#### 5.1.2 Felhasználói Profil
- ✅ Avatar feltöltés (Storage)
- ✅ Avatar emoji kiválasztás (előre definiált emoji-k)
- ✅ Név módosítás
- ✅ Jelszó változtatás
- ✅ ELO, győzelmek, vereségek, döntetlenek megjelenítés
- ✅ Beállítások (hang, értesítések, téma)

#### 5.1.3 Guest Felhasználók
- Anonymous auth Firebase-ben
- UID: "guest_" prefixszel
- Korlátozott funkciók (ELO nem mentődik Firestore-ba)

### 5.2 Játék Funkciók

#### 5.2.1 Játék Létrehozás
- ✅ Időkorlát választás (1, 3, 5, 10, 15, 30 perc)
- ✅ Increment választás (0-30 másodperc)
- ✅ Ellenfél típus: Human vagy AI
- ✅ AI nehézség választás (1-8 szint)
- ✅ Automatikus játék ID generálás

#### 5.2.2 Játék Menete
- ✅ Valós idejű szinkronizáció (Firebase Realtime DB)
- ✅ Sakkóra (Fischer óra increment-tel)
- ✅ Lépés validálás (Chess.js)
- ✅ Lépéstörténet megjelenítés
- ✅ Történet visszanézése (freeze board)
- ✅ Kiemelt négyzetek (utolsó lépés, lehetséges lépések)
- ✅ Drag & Drop bábu mozgatás
- ✅ Click-click bábu mozgatás
- ✅ Automatic queen promotion
- ✅ Néző mód (spectator)

#### 5.2.3 Játék Vége Feltételek
- ✅ **Matt** (checkmate)
- ✅ **Időtúllépés** (timeout)
- ✅ **Patt** (stalemate)
- ✅ **Háromszori ismétlés** (threefold repetition)
- ✅ **Anyaghiány** (insufficient material)
- ✅ **50 lépés szabály** (draw)
- ✅ **Feladás** (resignation)
- ✅ **Döntetlen egyezség** (agreement)
- ✅ **Megszakítás** (aborted - 0-1 lépés után, ELO változás nélkül)

#### 5.2.4 Játék Közben Akciók
- ✅ Döntetlen ajánlás (Draw Offer)
- ✅ Döntetlen elfogadás/elutasítás
- ✅ Feladás (Surrender) - megerősítő modal-lal
- ✅ Megszakítás (Abort) - csak 0-1 lépés után

#### 5.2.5 ELO Rendszer
- ✅ **K-faktor**: 32
- ✅ **Kezdő ELO**: 1200
- ✅ **Számítás**: Standard ELO formula
  ```
  Expected = 1 / (1 + 10^((opponent_elo - player_elo) / 400))
  New ELO = Old ELO + K * (Actual - Expected)
  ```
- ✅ Győzelem: +ELO
- ✅ Vereség: -ELO
- ✅ Döntetlen: ±ELO (várható eredménytől függ)
- ✅ Megszakítás: Nincs ELO változás
- ✅ Firestore frissítés játék végén

### 5.3 AI Ellenfél (Lichess Integráció)

#### 5.3.1 Lichess Board API
- ✅ Token alapú authentikáció
- ✅ AI játék challenge (difficulty 1-8)
- ✅ Szín kiválasztás (white, black, random)
- ✅ Időkorlát szinkronizálás
- ✅ Real-time game state streaming
- ✅ Move submission (UCI format)

#### 5.3.2 AI Szolgáltatások
- ✅ `aiGameService.ts`:
  - `startAIGame()` - AI challenge
  - `streamAIGameState()` - Stream Lichess game events
  - `makeAIMove()` - Lépés küldés Lichess-re
  - `getHint()` - Cloud evaluation API (best move hint)
  - `cleanupGame()` - Cleanup Lichess game

#### 5.3.3 Lichess Cloud Evaluation
- ✅ Ingyenes, token nélkül használható
- ✅ Best move javaslat
- ✅ Evaluation érték (centipawn)
- ❌ Jelenleg nincs UI integráció

### 5.4 Lobby & Játék Keresés

#### 5.4.1 Lobby Funkciók
- ✅ Aktív játékok listázása (status: "waiting" vagy "ongoing")
- ✅ Játék részletek (időkorlát, játékosok, ELO)
- ✅ Join button (ha van szabad hely)
- ✅ Spectate button (ha tele van)
- ✅ Valós idejű frissítés (Firebase listener)
- ✅ Játékos profil modal (kattintható nevek)

#### 5.4.2 Játék Szűrés
- ❌ Jelenleg nincs szűrés
- 🔮 Tervezett: Időkorlát szerinti szűrés, ELO range, AI/Human

### 5.5 Játéktörténet (My Games)

#### 5.5.1 Befejezett Játékok
- ✅ Csak a felhasználó saját befejezett játékai
- ✅ Sorrendezés: Legfrissebb elől
- ✅ Megjelenített adatok:
  - Game ID (utolsó 6 karakter)
  - Játékosok nevei és ELO-ja
  - Győztes/vesztes/döntetlen kiemelés
  - ELO változás (+/-)
  - Időbélyeg (relative time: "2h ago")
- ✅ Kattintható - replay mód

#### 5.5.2 Replay Mód
- ✅ Visszanézhetők a befejezett játékok
- ✅ Lépéstörténet navigáció
- ✅ Freeze board pozíció
- ✅ "Go to latest" gomb

### 5.6 Leaderboard (Rangsor)

#### 5.6.1 Top Játékosok
- ✅ Top 100 játékos ELO szerint
- ✅ Megjelenített adatok:
  - Rank (helyezés)
  - Avatar
  - Név
  - ELO
  - Győzelmek / Vereségek
  - Win rate %
- ✅ Expand/collapse toggle

#### 5.6.2 Frissítés
- ✅ Firestore query (orderBy elo, limit 100)
- ❌ Nincs valós idejű frissítés (csak oldal betöltéskor)

### 5.7 Chat Rendszer

#### 5.7.1 Játék Közben Chat
- ✅ ChatBox komponens (ChessGameView-ban)
- ✅ Valós idejű üzenetek
- ❌ **Jelenleg nem implementált backend**
- 🔮 Tervezett: Firestore alapú chat

### 5.8 Beállítások

#### 5.8.1 Profil Beállítások
- ✅ Avatar módosítás (upload vagy emoji)
- ✅ Név módosítás
- ✅ Jelszó változtatás
- ✅ Statisztikák megjelenítés

#### 5.8.2 Alkalmazás Beállítások
- ✅ Hang be/ki
- ✅ Értesítések be/ki
- ✅ Téma választás (UI van, de nincs dark mode implementálva)
- ❌ Billing, Friends, Security, Notifications tabok üresek

---

## 6. Komponensek

### 6.1 Oldal Komponensek (Pages)

#### 6.1.1 Home (`home.tsx`)
**Cél**: Főoldal, CTA gombok, funkciók bemutatása

**Funkciók**:
- Hero section animációkkal
- Quick Play gomb (CreateGameModal megnyitása)
- Funkciók showcase (AI játék, ELO rendszer, stb.)
- "Join the Chess Revolution" CTA

**Props**: Nincs

**State**:
- `showCreateGameModal` - Modal láthatóság

**Routing**: `/`

---

#### 6.1.2 Lobby (`lobby.tsx`)
**Cél**: Aktív játékok böngészése, csatlakozás

**Funkciók**:
- Aktív játékok listázása
- Szűrés: status !== "ended"
- Join / Spectate gombok
- Create Game gomb
- Player profile modal

**Props**: Nincs

**State**:
- `games` - Játékok lista
- `currentUser` - Bejelentkezett user
- `loading` - Betöltés state
- `profileDropdown` - Profil modal state
- `showCreateGameModal` - Create modal láthatóság

**Firebase Listeners**:
- `ref(db, "games")` - Valós idejű játékok
- `onAuthStateChanged` - User state

**Routing**: `/lobby`

---

#### 6.1.3 ChessGame (`ChessGame.tsx`)
**Cél**: Fő játék logika és állapot kezelés

**Funkciók**:
- Chess.js instance kezelése
- Firebase Realtime sync
- Játékos csatlakozás automatizálás
- Lépés kezelés és validálás
- Időkezelés
- Game end detekció
- Döntetlen ajánlás/elfogadás/elutasítás
- Feladás/megszakítás
- Service layer integráció

**Props**: Nincs (URL paraméter: `gameId`)

**State**:
- `chessPosition` - Aktuális FEN
- `moveFrom` - Kiválasztott bábu
- `optionSquares` - Lehetséges lépések highlightok
- `lastMoveSquares` - Utolsó lépés highlight
- `moveHistory` - Lépéstörténet
- `gameData` - Firebase game object
- `currentUser` - User
- `viewingHistoryIndex` - Történet navigáció
- `timeLeft` - Hátralevő idő
- `showEndModal`, `showSurrenderConfirm`, `showDrawOfferModal` - Modal states
- `eloChanges` - ELO változások

**Firebase Listeners**:
- `ref(db, 'games/${gameId}')` - Játék state
- `onAuthStateChanged` - User state

**Services Used**:
- `gameService.createNewGame()`
- `gameService.updateGameInDb()`
- `gameService.updateFirestoreOnGameEnd()`
- `gameService.saveStartingElo()`
- `playerService.joinGame()`
- `playerService.getRemainingTime()`
- `playerService.getPlayerSide()`

**Routing**: `/game/:gameId`

---

#### 6.1.4 ChessGameView (`ChessGameView.tsx`)
**Cél**: Játék UI renderelés (prezentációs komponens)

**Funkciók**:
- Sakktábla renderelés (react-chessboard)
- PlayerInfo komponensek (top & bottom)
- ChessClock komponensek
- MoveHistory komponens
- ChatBox komponens
- Action buttons (surrender, draw, abort)

**Props**:
```typescript
{
  chessPosition: string;
  optionSquares: Record<string, CSSProperties>;
  lastMoveSquares: { from: string; to: string } | null;
  players: { white?: Player; black?: Player } | null;
  currentUser: User | null;
  currentTurn: "white" | "black";
  moveHistory: MoveHistoryType[];
  viewingHistoryIndex: number | null;
  timeLeft: { white: number; black: number };
  gameStatus?: string;
  startingElo?: { white: number; black: number };
  finalElo?: { white: number; black: number };
  eloChanges?: { whiteChange: number; blackChange: number } | null;
  gameId?: string;
  onSquareClick: (args: SquareHandlerArgs) => void;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onViewMove: (index: number) => void;
  onGoToLatest: () => void;
  onSurrender: () => void;
  onOfferDraw?: () => void;
  onAbort?: () => void;
  onTimeExpired?: (side: "white" | "black") => void;
}
```

**Logika**:
- Board orientation (fehér alul, ha fehér játékos)
- Top/bottom player meghatározás
- ELO számítások (starting, current, changes)

**Routing**: Nincs (child component)

---

#### 6.1.5 MyGames (`mygames.tsx`)
**Cél**: Felhasználó befejezett játékainak listázása

**Funkciók**:
- Saját befejezett játékok szűrése
- Sorrendezés: updatedAt desc
- Game card-ok megjelenítése
- Player profile modal
- Relative time ("2h ago")
- Win/Loss/Draw badge-ek
- ELO változás megjelenítés

**Props**: Nincs

**State**:
- `games` - Befejezett játékok
- `currentUser` - User
- `userLoading`, `gamesLoading` - Loading states
- `profileDropdown` - Profile modal state

**Firebase Listeners**:
- `ref(db, "games")` - Összes játék (szűrés client-side)
- `onAuthStateChanged` - User state

**Routing**: `/mygames`

---

#### 6.1.6 Leaderboard (`leaderboard.tsx`)
**Cél**: Top játékosok rangsor megjelenítése

**Funkciók**:
- Top 100 játékos lekérdezése
- ELO szerinti sorrendezés
- Win rate számítás
- Expand/collapse toggle
- Avatar megjelenítés

**Props**: Nincs

**State**:
- `players` - Top 100 játékos
- `loading` - Betöltés state
- `showAll` - Teljes lista toggle

**Firebase Query**:
```typescript
query(
  collection(firestore, "users"),
  orderBy("elo", "desc"),
  limit(100)
)
```

**Routing**: `/leaderboard`

---

#### 6.1.7 Settings (`settings.tsx`)
**Cél**: Felhasználói beállítások kezelése

**Funkciók**:
- Sidebar navigáció (6 tab)
- Csak "Profile" tab implementált (GeneralSettings)
- Többi tab placeholder

**Props**: Nincs

**State**:
- `activeTab` - Aktív tab

**Child Components**:
- `GeneralSettings` - Profil beállítások

**Routing**: `/profile`

---

### 6.2 UI Komponensek (Components)

#### 6.2.1 Header (`header.tsx`)
**Funkciók**:
- Navigációs menü
- User avatar dropdown
- Logout gomb
- Mobile hamburger menu
- Sticky header

**Firebase Listeners**:
- `onAuthStateChanged` - User & avatar betöltés

---

#### 6.2.2 Layout (`Layout.tsx`)
**Funkciók**:
- Wrapper component
- Header beágyazás
- Children renderelés

---

#### 6.2.3 LoginForm (`LoginForm.tsx`)
**Funkciók**:
- Email/password login
- Google OAuth
- Guest login
- Animált háttér
- Error handling

---

#### 6.2.4 RegisterForm (`RegisterForm.tsx`)
**Funkciók**:
- Email/password regisztráció
- User profil létrehozás Firestore-ban
- Error handling

---

#### 6.2.5 PlayerInfo (`PlayerInfo.tsx`)
**Funkciók**:
- Játékos név, avatar, ELO megjelenítés
- Kattintható - PlayerProfileModal
- Guest badge
- ELO változás megjelenítés (+/-)
- Pozíció: top vagy bottom

**Props**:
```typescript
{
  color: "white" | "black";
  player: Player | null;
  position?: "top" | "bottom";
  startingElo?: number;
  currentElo?: number;
  eloChange?: number;
}
```

---

#### 6.2.6 ChessClock (`ChessClock.tsx`)
**Funkciók**:
- Countdown timer
- Active/inactive state
- Warning színek (piros < 20s)
- onTimeExpired callback

**Props**:
```typescript
{
  initialTime: number;        // milliseconds
  active: boolean;
  onTimeExpired?: () => void;
}
```

---

#### 6.2.7 MoveHistory (`moveHistory.tsx`)
**Funkciók**:
- Lépéstörténet megjelenítés
- Kattintható lépések - visszanézés
- Aktuális lépés highlight
- "Go to Latest" gomb
- Scroll to bottom auto

**Props**:
```typescript
{
  moveHistory: MoveHistoryType[];
  viewingHistoryIndex: number | null;
  onViewMove: (index: number) => void;
  onGoToLatest: () => void;
}
```

---

#### 6.2.8 ChatBox (`ChatBox.tsx`)
**Funkciók**:
- Chat UI
- ❌ Backend nincs implementálva
- Placeholder üzenetek

**Props**:
```typescript
{
  gameId?: string;
}
```

---

#### 6.2.9 Modals

##### GameEndModal (`GameEndModal.tsx`)
- Játék vége megjelenítés
- Győztes, vesztes, döntetlen
- Win reason
- ELO változások
- "New Game", "Rematch" gombok (placeholder)

##### ConfirmSurrenderModal (`ConfirmSurrenderModal.tsx`)
- Feladás megerősítés
- Figyelmeztető üzenet
- Confirm/Cancel gombok

##### DrawOfferModal (`DrawOfferModal.tsx`)
- Döntetlen ajánlat értesítés
- Ellenfél neve
- Accept/Decline gombok

##### CreateGameModal (`CreateGameModal.tsx`)
- Játék létrehozás form
- Time control slider (1-30 perc)
- Increment slider (0-30 sec)
- Opponent type: Human/AI
- AI difficulty (1-8) ha AI választva
- Create/Cancel gombok

##### PlayerProfileModal (`PlayerProfileModal.tsx`)
- Játékos profil részletek
- Avatar, név, ELO
- Starting/Final ELO (ha játék véget ért)
- ELO változás
- Win/Loss statisztikák
- User ID

---

#### 6.2.10 GeneralSettings (`GeneralSettings.tsx`)
**Funkciók**:
- Avatar upload (Firebase Storage)
- Avatar emoji választás
- Név módosítás
- Jelszó változtatás
- Hang/értesítések toggle
- Téma választás (placeholder)
- Statisztikák megjelenítés

---

## 7. Service Layer

### 7.1 gameService.ts
**Cél**: Játék logika és Firebase műveletek

**Főbb Metódusok**:
```typescript
class GameService {
  // Játék létrehozás
  async createNewGame(gameId: string, settings?: GameSettings): Promise<void>

  // Játék frissítés lépés után
  async updateGameInDb(
    gameId: string,
    gameData: Game,
    chessGame: Chess,
    fen: string,
    move: Move
  ): Promise<{ whiteChange: number; blackChange: number } | null>

  // Döntetlen ok meghatározás
  getDrawReason(chessGame: Chess): winReason | null

  // ELO számítás
  calculateEloChange(
    winnerElo: number,
    loserElo: number,
    isDraw?: boolean
  ): { winnerChange: number; loserChange: number }

  // Firestore frissítés játék végén
  async updateFirestoreOnGameEnd(
    gameId: string,
    gameData: Game,
    winner: "white" | "black" | "draw" | null
  ): Promise<{ whiteChange: number; blackChange: number } | null>

  // Kezdő ELO mentése
  async saveStartingElo(
    gameId: string,
    whiteUid: string,
    blackUid: string
  ): Promise<void>

  // Döntetlen ajánlás
  async offerDraw(gameId: string, userId: string): Promise<void>

  // Döntetlen elfogadás
  async acceptDraw(gameId: string, gameData: Game): Promise<void>

  // Döntetlen elutasítás
  async declineDraw(gameId: string): Promise<void>

  // Feladás
  async surrenderGame(
    gameId: string,
    gameData: Game,
    playerSide: "white" | "black"
  ): Promise<void>

  // Megszakítás
  async abortGame(gameId: string): Promise<void>

  // Időtúllépés kezelés
  async handleTimeout(
    gameId: string,
    gameData: Game,
    side: "white" | "black"
  ): Promise<void>
}
```

**Singleton Export**:
```typescript
export const gameService = new GameService();
```

---

### 7.2 playerService.ts
**Cél**: Játékos kezelés és adatok

**Főbb Metódusok**:
```typescript
class PlayerService {
  // Játékhoz csatlakozás
  async joinGame(
    gameId: string,
    user: User,
    gameData: Game
  ): Promise<"white" | "black" | null>

  // Játékos oldala
  getPlayerSide(user: User | null, gameData: Game | null): "white" | "black" | null

  // Játékos vagy néző?
  isPlayer(user: User | null, gameData: Game | null): boolean

  // Néző?
  isSpectator(user: User | null, gameData: Game | null): boolean

  // Játékos adatok Firestore-ból
  async getPlayerData(userId: string): Promise<{
    elo: number;
    wins: number;
    losses: number;
    draws: number;
  }>

  // Mindkét játékos csatlakozott?
  bothPlayersJoined(gameData: Game | null): boolean

  // Ellenfél adatai
  getOpponent(user: User | null, gameData: Game | null): Player | null

  // Hátralevő idő számítás
  getRemainingTime(
    side: "white" | "black",
    gameData: Game | null,
    currentTurn: "white" | "black"
  ): number
}
```

**Singleton Export**:
```typescript
export const playerService = new PlayerService();
```

---

### 7.3 aiGameService.ts
**Cél**: AI játék kezelés Lichess API-val

**Főbb Metódusok**:
```typescript
class AIGameService {
  // Lichess inicializálás
  initializeLichess(token: string): void

  // AI játék indítás
  async startAIGame(
    firebaseGameId: string,
    level: number,
    color: "white" | "black" | "random",
    clock?: { limit: number; increment: number }
  ): Promise<{ lichessGameId: string; assignedColor: "white" | "black" }>

  // Lichess game state stream
  streamAIGameState(
    firebaseGameId: string,
    lichessGameId: string,
    onMove: (uciMove: string, fen: string) => void
  ): () => void

  // Lépés küldés Lichess-re
  async makeAIMove(lichessGameId: string, move: string): Promise<void>

  // Best move hint (Cloud Evaluation)
  async getHint(fen: string): Promise<string | null>

  // Cleanup
  cleanupGame(firebaseGameId: string): void
}
```

**Singleton Export**:
```typescript
export const aiGameService = new AIGameService();
```

---

### 7.4 lichessService.ts
**Cél**: Lichess API direct integráció

**Főbb Metódusok**:
```typescript
// AI challenge
async challengeAI(
  token: string,
  level: number,
  clock?: { limit: number; increment: number },
  color?: "white" | "black" | "random"
): Promise<{ gameId: string }>

// Lépés küldés
async makeMove(token: string, gameId: string, move: string): Promise<void>

// Game state stream
function streamGameState(
  token: string,
  gameId: string,
  onEvent: (event: any) => void
): () => void

// Cloud Evaluation (ingyenes, token nélkül)
async getCloudEvaluation(fen: string, multiPv?: number): Promise<any>

// Best move javaslat
async getBestMove(fen: string): Promise<string | null>
```

**Named Exports** (nem singleton):
```typescript
export { challengeAI, makeMove, streamGameState, ... }
```

---

### 7.5 userService.ts
**Cél**: Felhasználói profilok Firestore-ban

**Főbb Metódusok**:
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

// Profil létrehozás
async function createUserProfile(user: User): Promise<UserProfile>

// Profil lekérés
async function getUserProfile(user: User): Promise<UserProfile>

// ELO frissítés
async function updateUserElo(uid: string, newElo: number): Promise<void>

// Győzelem növelés
async function incrementWins(uid: string): Promise<void>

// Vereség növelés
async function incrementLosses(uid: string): Promise<void>

// Döntetlen növelés
async function incrementDraws(uid: string): Promise<void>
```

---

## 8. Routing & Navigáció

### 8.1 Route Konfiguráció

```typescript
<Router>
  <Routes>
    <Route path="/" element={<Layout><Home /></Layout>} />
    <Route path="/profile" element={<Layout><SettingsScreen /></Layout>} />
    <Route path="/lobby" element={<Layout><Lobby /></Layout>} />
    <Route path="/mygames" element={<Layout><MyGames /></Layout>} />
    <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
    <Route path="/login" element={<LoginForm />} />
    <Route path="/register" element={<RegisterForm />} />
    <Route path="/test" element={<Layout><TailwindColumns /></Layout>} />
    <Route path="/game/:gameId" element={<Layout><ChessGame /></Layout>} />
  </Routes>
</Router>
```

### 8.2 Navigációs Struktúra

```
Header Navigation:
├── Home (/)
├── Profile (/profile)
├── Lobbies (/lobby)
├── My Games (/mygames)
└── Leaderboard (/leaderboard)

Auth:
├── Login (/login)
└── Register (/register)

Game:
└── /game/:gameId (dynamic)
```

### 8.3 Védett Route-ok
❌ **Jelenleg nincs implementálva**
- Minden route publikus
- Auth state ellenőrzés komponens szinten

---

## 9. Biztonsági Követelmények

### 9.1 Firebase Security Rules

#### 9.1.1 Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
**Problémák**:
- ❌ Túl permisszív (minden bejelentkezett user írhat/olvashat mindent)
- 🔮 Javítandó: User saját dokumentumait írhatja, mások olvashatók

#### 9.1.2 Realtime Database Rules
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```
**Problémák**:
- ❌ Túl restriktív (semmi nem működik)
- 🔮 Javítandó: Auth alapú hozzáférés

**Ajánlott Rules**:
```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### 9.2 API Kulcsok
- ✅ `.env` fájlban tárolva
- ✅ `.gitignore`-ban
- ❌ Firebase API kulcs nincs domain-re korlátozva
- 🔮 Javítandó: Firebase Console-ban domain whitelist

### 9.3 Lichess Token
- ✅ `.env` fájlban (`VITE_LICHESS_TOKEN`)
- ✅ Csak AI játékokhoz szükséges
- ❌ Client-side tárolva (nem titkosított)
- 🔮 Javaslat: Server-side proxy (Firebase Functions)

---

## 10. Deployment

### 10.1 Build Process
```bash
npm run build
```
- TypeScript compile (`tsc -b`)
- Vite build
- Output: `dist/` folder

### 10.2 Hosting
- **Platform**: Firebase Hosting
- **URL**: `https://bme-chessapp.web.app`
- **Deploy Command**:
  ```bash
  firebase deploy --only hosting
  ```

### 10.3 Environment Variables

#### Development (`.env`)
```env
VITE_APP_TITLE=ChessApp
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_LICHESS_TOKEN=lip_...
```

#### Production (`.env.production`)
- Ugyanaz, mint `.env`
- Build time-ban beégetődik (Vite)

### 10.4 CI/CD
- ❌ **GitHub Actions törölve** (auto-deploy kikapcsolva)
- ✅ Manuális deployment (`firebase deploy`)

---

## 11. Hiányosságok & Fejlesztési Javaslatok

### 11.1 Kritikus Hiányosságok

#### 11.1.1 Firebase Security Rules
**Probléma**: Realtime DB írás/olvasás blokkolva
**Megoldás**:
```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null && (
          !data.exists() || 
          data.child('players/white/uid').val() == auth.uid || 
          data.child('players/black/uid').val() == auth.uid
        )"
      }
    }
  }
}
```

#### 11.1.2 Firestore Security Rules
**Probléma**: Túl permisszív
**Megoldás**:
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

#### 11.1.3 Chat Backend
**Probléma**: ChatBox komponens van, de nincs backend
**Megoldás**: Firestore alapú chat collection

### 11.2 UX Javítások

- ❌ Loading states hiányosak
- ❌ Error handling hiányos
- ❌ Nincs offline support
- ❌ Nincs PWA support
- ❌ Nincs dark mode (csak placeholder)
- ❌ Settings tabok üresek (Billing, Friends, stb.)

### 11.3 Teljesítmény

- ❌ Nincs code splitting
- ❌ Nincs lazy loading
- ❌ Firebase listeners nem mindig tisztítódnak
- ❌ Sok re-render (optimalizálható React.memo-val)

### 11.4 Funkcionális Hiányosságok

- ❌ Nincs AI hint gomb (Lichess Cloud Eval van, de nincs UI)
- ❌ Nincs game invite system (link megosztás)
- ❌ Nincs friend system
- ❌ Nincs rematch funkció
- ❌ Nincs game analysis
- ❌ Nincs puzzle/training mode

---

## 12. Tesztelés

### 12.1 Jelenlegi Teszt Státusz
- ❌ **Nincs unit teszt**
- ❌ **Nincs integration teszt**
- ❌ **Nincs E2E teszt**
- ✅ Manuális tesztelés csak

### 12.2 Ajánlott Tesztek

#### Unit Tesztek
- `gameService.calculateEloChange()`
- `gameService.getDrawReason()`
- `playerService.getRemainingTime()`
- Chess.js move validation

#### Integration Tesztek
- Firebase CRUD műveletek
- Lichess API hívások
- Auth flow

#### E2E Tesztek (Playwright/Cypress)
- Teljes játék flow
- Lobby join
- Game end scenarios

---

## 13. Dokumentáció

### 13.1 Meglévő Dokumentáció
- ✅ `README.md` (chess-frontend) - Setup instructions
- ✅ `services/README.md` - Service layer dokumentáció
- ✅ `services/lichessService.README.md` - Lichess API docs
- ✅ `SPECIFICATION.md` - Ez a fájl

### 13.2 Hiányzó Dokumentáció
- ❌ API dokumentáció
- ❌ Komponens dokumentáció (Storybook)
- ❌ Deployment guide
- ❌ Contributing guide
- ❌ Architecture Decision Records (ADR)

---

## 14. Licenc & Szerzői Jog

**Tulajdonos**: Sándor Török
**GitHub**: sandortorok/ChessApp
**Projekt Státusz**: 🚧 Fejlesztés alatt

---

## 15. Tervezési Minták

### 15.1 Jelenlegi Tervezési Minták

#### 15.1.1 Singleton Pattern
**Használat**: Service layer
```typescript
// gameService.ts
class GameService {
  // ... implementation
}
export const gameService = new GameService();

// playerService.ts
class PlayerService {
  // ... implementation
}
export const playerService = new PlayerService();
```

**Előnyök**:
- ✅ Egyetlen service instance az alkalmazásban
- ✅ Központosított state és logika
- ✅ Könnyű tesztelhetőség (mockable)

**Alkalmazás**:
- `gameService` - Játék műveletek
- `playerService` - Játékos műveletek
- `aiGameService` - AI játék kezelés

---

#### 15.1.2 Service Layer Pattern
**Használat**: Üzleti logika elkülönítése

```typescript
// ChessGame.tsx (Controller)
const handleMove = async () => {
  await gameService.updateGameInDb(gameId, gameData, chessGame, fen, move);
};

// gameService.ts (Service)
class GameService {
  async updateGameInDb(...) {
    // Üzleti logika: validálás, időszámítás, ELO, Firebase
  }
}
```

**Előnyök**:
- ✅ Separation of Concerns
- ✅ Újrafelhasználható logika
- ✅ Könnyen tesztelhető
- ✅ Komponensek egyszerűbbek

**Alkalmazás**:
- Játék műveletek (create, update, end)
- Játékos műveletek (join, getPlayerData)
- AI műveletek (Lichess API hívások)

---

#### 15.1.3 Presentational & Container Components
**Használat**: UI és logika szétválasztása

```typescript
// ChessGame.tsx (Container - Smart Component)
const ChessGame = () => {
  // State, Firebase listeners, game logic
  const [chessPosition, setChessPosition] = useState(...)
  const [gameData, setGameData] = useState(...)
  // ...
  return <ChessGameView {...props} />;
}

// ChessGameView.tsx (Presentational - Dumb Component)
const ChessGameView = (props) => {
  // Csak renderelés, nincs business logic
  return <div>...</div>;
}
```

**Előnyök**:
- ✅ Tisztább komponens struktúra
- ✅ UI könnyen újrafelhasználható
- ✅ Könnyebb tesztelés

**Alkalmazás**:
- `ChessGame` (logika) + `ChessGameView` (UI)
- `PlayerInfo` (prezentációs)
- `ChessClock` (prezentációs)

---

#### 15.1.4 Observer Pattern (Firebase Real-time)
**Használat**: Real-time adatszinkronizáció

```typescript
// Firebase listener (Observer)
useEffect(() => {
  const gameRef = ref(db, `games/${gameId}`);
  const unsubscribe = onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    setGameData(data); // Automatikus UI frissítés
  });
  return () => unsubscribe(); // Cleanup
}, [gameId]);
```

**Előnyök**:
- ✅ Automatikus UI frissítés
- ✅ Multi-user real-time sync
- ✅ Event-driven architecture

**Alkalmazás**:
- Játék állapot (lépések, idő, status)
- Játékos csatlakozás
- Chat üzenetek (placeholder)

---

#### 15.1.5 Custom Hooks Pattern
**Használat**: Logika újrafelhasználás

```typescript
// useAuth.ts
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);
  
  return { currentUser, loading };
};

// Használat komponensben
const { currentUser, loading } = useAuth();
```

**Előnyök**:
- ✅ Logika megosztás komponensek között
- ✅ Tisztább komponensek
- ✅ Könnyebb tesztelés

**Alkalmazás**:
- `useAuth()` - Authentication state
- 🔮 Potenciális: `useGame(gameId)`, `usePlayer(userId)`

---

#### 15.1.6 Composition Pattern
**Használat**: Layout komponensek

```typescript
// Layout.tsx
const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
};

// Használat
<Layout>
  <Home />
</Layout>
```

**Előnyök**:
- ✅ Flexibilis komponens struktúra
- ✅ Újrafelhasználható layout
- ✅ Children prop pattern

**Alkalmazás**:
- `Layout` komponens (Header + content wrapper)
- Modal komponensek (backdrop + content)

---

#### 15.1.7 Strategy Pattern (implicit)
**Használat**: ELO számítás, game end logika

```typescript
// gameService.ts
getDrawReason(chessGame: Chess): winReason | null {
  if (chessGame.isStalemate()) return "stalemate";
  if (chessGame.isThreefoldRepetition()) return "threefoldRepetition";
  if (chessGame.isInsufficientMaterial()) return "insufficientMaterial";
  if (chessGame.isDraw()) return "draw";
  return null;
}
```

**Előnyök**:
- ✅ Különböző algoritmusok (stalemate, checkmate, timeout)
- ✅ Könnyen bővíthető új win conditions-el

**Alkalmazás**:
- Game end detekció (9 különböző ok)
- ELO számítás (győzelem, vereség, döntetlen)

---

#### 15.1.8 Module Pattern
**Használat**: Service exports

```typescript
// services/index.ts
export { gameService } from './gameService';
export { playerService } from './playerService';
export { aiGameService } from './aiGameService';
export * from './lichessService';
export * from './userService';

// Használat
import { gameService, playerService } from '@/services';
```

**Előnyök**:
- ✅ Központosított exports
- ✅ Tisztább imports
- ✅ Namespace protection

---

### 15.2 Hiányzó Tervezési Minták (Javaslatok)

#### 15.2.1 Repository Pattern
**Cél**: Adatbázis műveletek absztrakciója

```typescript
// Ajánlott implementáció
class GameRepository {
  async findById(gameId: string): Promise<Game | null> { }
  async save(game: Game): Promise<void> { }
  async update(gameId: string, updates: Partial<Game>): Promise<void> { }
  async delete(gameId: string): Promise<void> { }
  async findByUserId(userId: string): Promise<Game[]> { }
}

class UserRepository {
  async findById(userId: string): Promise<UserProfile | null> { }
  async save(user: UserProfile): Promise<void> { }
  async updateElo(userId: string, elo: number): Promise<void> { }
  async getTopPlayers(limit: number): Promise<UserProfile[]> { }
}
```

**Előnyök**:
- ✅ Firebase specifikus logika elrejtése
- ✅ Könnyebb váltás más DB-re
- ✅ Mockable teszteléshez
- ✅ Centralizált query logika

**Jelenlegi probléma**: Firebase hívások szétszórva a service-ekben

---

#### 15.2.2 Factory Pattern
**Cél**: Komplex objektumok létrehozása

```typescript
// Ajánlott implementáció
class GameFactory {
  createHumanGame(settings: GameSettings): Game {
    return {
      fen: INITIAL_FEN,
      moves: [],
      players: { white: null, black: null },
      status: "waiting",
      timeControl: settings.timeControl,
      opponentType: "human",
      // ... default values
    };
  }
  
  createAIGame(settings: AIGameSettings): Game {
    return {
      ...this.createHumanGame(settings),
      opponentType: "ai",
      lichessGameId: null,
    };
  }
}

class PlayerFactory {
  createPlayerFromFirebaseUser(user: User): Player {
    return {
      uid: user.uid,
      name: user.displayName || user.email,
      displayName: user.displayName,
      email: user.email,
      elo: 1200, // Default
      wins: 0,
      losses: 0,
      draws: 0,
    };
  }
}
```

**Előnyök**:
- ✅ Konzisztens objektum létrehozás
- ✅ Default értékek központosítása
- ✅ Könnyebb tesztelés

**Jelenlegi probléma**: Objektum létrehozás szétszórva (gameService, playerService)

---

#### 15.2.3 Facade Pattern
**Cél**: Komplex API-k egyszerűsítése

```typescript
// Ajánlott implementáció
class ChessFacade {
  private gameService: GameService;
  private playerService: PlayerService;
  private aiGameService: AIGameService;
  
  async startNewGame(userId: string, settings: GameSettings): Promise<string> {
    const gameId = generateId();
    await this.gameService.createNewGame(gameId, settings);
    await this.playerService.joinGame(gameId, userId);
    if (settings.opponentType === "ai") {
      await this.aiGameService.startAIGame(gameId, settings.aiLevel);
    }
    return gameId;
  }
  
  async makeMove(gameId: string, move: Move): Promise<void> {
    // Orchestrate multiple services
    await this.gameService.updateGameInDb(...);
    if (gameData.opponentType === "ai") {
      await this.aiGameService.makeAIMove(...);
    }
  }
}
```

**Előnyök**:
- ✅ Egyszerűsített API komponenseknek
- ✅ Több service koordinálása
- ✅ Komponensek kevesebb service-től függenek

**Jelenlegi probléma**: Komponensek sok service-t importálnak

---

#### 15.2.4 Decorator Pattern
**Cél**: Funkciók dinamikus kiterjesztése

```typescript
// Ajánlott implementáció
class BaseGameService { }

class LoggingGameServiceDecorator extends BaseGameService {
  async updateGameInDb(...args) {
    console.log("Updating game:", args);
    const result = await super.updateGameInDb(...args);
    console.log("Game updated:", result);
    return result;
  }
}

class CachingGameServiceDecorator extends BaseGameService {
  private cache = new Map();
  
  async getGameById(gameId: string) {
    if (this.cache.has(gameId)) {
      return this.cache.get(gameId);
    }
    const game = await super.getGameById(gameId);
    this.cache.set(gameId, game);
    return game;
  }
}
```

**Előnyök**:
- ✅ Logging hozzáadása production-ben
- ✅ Caching réteg
- ✅ Performance monitoring
- ✅ Error tracking

**Használati eset**: Development vs Production különbségek

---

#### 15.2.5 Command Pattern
**Cél**: Akciók visszavonhatósága (Undo/Redo)

```typescript
// Ajánlott implementáció
interface Command {
  execute(): void;
  undo(): void;
}

class MoveCommand implements Command {
  constructor(
    private chessGame: Chess,
    private move: Move
  ) {}
  
  execute() {
    this.chessGame.move(this.move);
  }
  
  undo() {
    this.chessGame.undo();
  }
}

class CommandHistory {
  private history: Command[] = [];
  private currentIndex = -1;
  
  execute(command: Command) {
    command.execute();
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(command);
    this.currentIndex++;
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].execute();
    }
  }
}
```

**Előnyök**:
- ✅ Undo/Redo funkció
- ✅ Move history tárolás
- ✅ Time travel debugging

**Használati eset**: Game analysis, training mode

---

#### 15.2.6 State Pattern
**Cél**: Játék állapot kezelés

```typescript
// Ajánlott implementáció
interface GameState {
  handleMove(game: Game, move: Move): void;
  canJoin(game: Game): boolean;
  canAbort(game: Game): boolean;
}

class WaitingState implements GameState {
  handleMove() {
    throw new Error("Game not started");
  }
  canJoin(game: Game) {
    return !game.players.white || !game.players.black;
  }
  canAbort() {
    return true;
  }
}

class OngoingState implements GameState {
  handleMove(game: Game, move: Move) {
    // Process move
  }
  canJoin() {
    return false;
  }
  canAbort(game: Game) {
    return game.moves.length <= 1;
  }
}

class EndedState implements GameState {
  handleMove() {
    throw new Error("Game ended");
  }
  canJoin() {
    return false;
  }
  canAbort() {
    return false;
  }
}
```

**Előnyök**:
- ✅ Állapot-specifikus logika
- ✅ Invalid operations prevention
- ✅ Tisztább kód

**Használati eset**: Game status validation (waiting, ongoing, ended)

---

#### 15.2.7 Middleware Pattern
**Cél**: Request/Response interceptors

```typescript
// Ajánlott implementáció
type Middleware = (context: any, next: () => Promise<any>) => Promise<any>;

class MiddlewareChain {
  private middlewares: Middleware[] = [];
  
  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }
  
  async execute(context: any) {
    let index = 0;
    const next = async () => {
      if (index < this.middlewares.length) {
        await this.middlewares[index++](context, next);
      }
    };
    await next();
  }
}

// Példa middlewares
const authMiddleware: Middleware = async (ctx, next) => {
  if (!ctx.user) throw new Error("Unauthorized");
  await next();
};

const loggingMiddleware: Middleware = async (ctx, next) => {
  console.log("Request:", ctx);
  await next();
  console.log("Response:", ctx);
};

const validationMiddleware: Middleware = async (ctx, next) => {
  if (!isValidMove(ctx.move)) throw new Error("Invalid move");
  await next();
};
```

**Előnyök**:
- ✅ Extensible request pipeline
- ✅ Cross-cutting concerns (auth, logging, validation)
- ✅ Reusable middlewares

**Használati eset**: Move validation pipeline, API call interceptors

---

#### 15.2.8 Dependency Injection
**Cél**: Loose coupling, testability

```typescript
// Ajánlott implementáció
interface IGameRepository {
  save(game: Game): Promise<void>;
  findById(gameId: string): Promise<Game | null>;
}

class FirebaseGameRepository implements IGameRepository {
  async save(game: Game) {
    await set(ref(db, `games/${game.id}`), game);
  }
  
  async findById(gameId: string) {
    const snapshot = await get(ref(db, `games/${gameId}`));
    return snapshot.val();
  }
}

class GameService {
  constructor(private gameRepo: IGameRepository) {}
  
  async createGame(settings: GameSettings) {
    const game = GameFactory.create(settings);
    await this.gameRepo.save(game);
    return game;
  }
}

// Container (használat)
const gameRepo = new FirebaseGameRepository();
const gameService = new GameService(gameRepo);

// Teszt (mock injection)
const mockRepo = new MockGameRepository();
const testService = new GameService(mockRepo);
```

**Előnyök**:
- ✅ Testability (mock dependencies)
- ✅ Loose coupling
- ✅ Swappable implementations

**Jelenlegi probléma**: Services közvetlenül használják Firebase-t, nem injektálható

---

#### 15.2.9 Event Emitter Pattern
**Cél**: Loose coupling komponensek között

```typescript
// Ajánlott implementáció
class GameEventEmitter extends EventEmitter {
  onMoveComplete(callback: (gameId: string, move: Move) => void) {
    this.on("moveComplete", callback);
  }
  
  onGameEnd(callback: (gameId: string, winner: string) => void) {
    this.on("gameEnd", callback);
  }
  
  emitMoveComplete(gameId: string, move: Move) {
    this.emit("moveComplete", gameId, move);
  }
  
  emitGameEnd(gameId: string, winner: string) {
    this.emit("gameEnd", gameId, winner);
  }
}

// Használat
const gameEvents = new GameEventEmitter();

gameEvents.onMoveComplete((gameId, move) => {
  console.log("Move completed:", move);
  // Update UI, play sound, etc.
});

gameEvents.onGameEnd((gameId, winner) => {
  // Show modal, update stats, etc.
});
```

**Előnyök**:
- ✅ Decoupled komponensek
- ✅ Event-driven architecture
- ✅ Easy to add listeners

**Használati eset**: Game events (move, capture, check, checkmate), Chat messages

---

### 15.3 Anti-Patterns (Elkerülendők)

#### 15.3.1 God Object
**Probléma**: `ChessGame.tsx` túl sok felelősség
- ✅ **Javítva**: Service layer bevezetéssel részben javult
- ⚠️ **Még mindig**: 615 sor, sok state

**Megoldás**: További szétbontás (useGameLogic hook, useTimer hook)

---

#### 15.3.2 Prop Drilling
**Probléma**: Props átadás sok szinten keresztül

```typescript
<ChessGame>
  <ChessGameView onMove={handleMove}>
    <MoveHistory onViewMove={handleViewMove}>
      <MoveItem onClick={...} />
```

**Megoldás**: Context API vagy State Management (Redux, Zustand)

---

#### 15.3.3 Magic Numbers
**Probléma**: Hardcoded értékek

```typescript
// Bad
if (timeLeft < 20000) { ... }

// Good
const TIME_WARNING_THRESHOLD_MS = 20000;
if (timeLeft < TIME_WARNING_THRESHOLD_MS) { ... }
```

**Javítás**: Constants fájl létrehozása

---

### 15.4 Összefoglaló Táblázat

| Minta | Használva? | Implementáció | Ajánlott? |
|-------|-----------|---------------|-----------|
| Singleton | ✅ Yes | Services | ✅ Keep |
| Service Layer | ✅ Yes | gameService, playerService | ✅ Keep |
| Presentational/Container | ✅ Yes | ChessGame/ChessGameView | ✅ Keep |
| Observer | ✅ Yes | Firebase listeners | ✅ Keep |
| Custom Hooks | ✅ Partial | useAuth | ✅ Expand |
| Composition | ✅ Yes | Layout, Modals | ✅ Keep |
| Strategy | ✅ Implicit | Game end logic | ✅ Make explicit |
| Module | ✅ Yes | services/index.ts | ✅ Keep |
| Repository | ❌ No | - | 🔥 High priority |
| Factory | ❌ No | - | ⚡ Medium priority |
| Facade | ❌ No | - | ⚡ Medium priority |
| Decorator | ❌ No | - | ✨ Nice to have |
| Command | ❌ No | - | ✨ Nice to have |
| State | ❌ No | - | ⚡ Medium priority |
| Middleware | ❌ No | - | ✨ Nice to have |
| Dependency Injection | ❌ No | - | 🔥 High priority |
| Event Emitter | ❌ No | - | ⚡ Medium priority |

---

## 16. Összefoglalás

### 16.1 Projekt Méret
- **Komponensek**: ~25
- **Services**: 5
- **Oldalak**: 7
- **Lines of Code**: ~8000+ (becsült)

### 16.2 Technológiai Érettség
- ✅ Modern React (19.x)
- ✅ TypeScript strict mode
- ✅ Firebase integráció
- ✅ Service layer architecture
- ✅ Real-time sync
- ✅ Singleton pattern (Services)
- ✅ Presentational/Container pattern
- ⚠️ Hiányos tesztek
- ⚠️ Biztonsági rések
- ⚠️ Nincs Repository pattern
- ⚠️ Nincs Dependency Injection

### 16.3 Production Ready?
**Részben**:
- ✅ Core funkciók működnek
- ✅ Deploy-olható
### 16.4 Következő Lépések (Prioritás szerint)

1. **🔥 Kritikus**:
   - Firebase Security Rules javítás
   - Error boundary implementálás
   - Loading states mindenütt
   - Repository Pattern bevezetése
   - Dependency Injection implementálás

2. **⚡ Fontos**:
   - Chat backend implementálás
   - Unit tesztek (legalább service layer)
   - Dark mode implementálás
   - Factory Pattern objektum létrehozáshoz
   - State Pattern játék állapot kezeléshez
   - Facade Pattern service orchestration-höz

3. **✨ Nice to have**:
   - AI hint gomb
   - Game analysis
   - Friend system
   - PWA support
   - Command Pattern (Undo/Redo)
   - Event Emitter Pattern
   - Decorator Pattern (logging, caching)

---

**Dokumentum Verzió**: 2.0.0  
**Utolsó Frissítés**: 2025-10-17  
**Szerző**: GitHub Copilot (kód alapján generálva)

**Changelog**:
- **v2.0.0** (2025-10-17): Tervezési minták szakasz hozzáadva (15. fejezet)
- **v1.0.0** (2025-10-17): Kezdeti verzió

**Dokumentum Verzió**: 1.0.0  
**Utolsó Frissítés**: 2025-10-17  
**Szerző**: GitHub Copilot (kód alapján generálva)

