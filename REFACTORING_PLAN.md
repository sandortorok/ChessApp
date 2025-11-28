# 📋 Refaktorálási Terv - ChessApp Kódbázis

> **Verzió:** 1.0
> **Dátum:** 2025-11-28
> **Státusz:** Tervezés

---

## 🎯 Főbb Problémák

A jelenlegi kódbázis elemzése során az alábbi problémákat azonosítottuk:

1. **Túl nagy komponensek** - Egyes fájlok 600+ sor hosszúak (ChessGame.tsx: 613, GeneralSettings.tsx: 593)
2. **Hiányzó absztrakciók** - Logika és UI keveredik a komponensekben
3. **Nem átlátható struktúra** - Root level komponensek (ChessGame.tsx, ChessGameView.tsx a src/-ben)
4. **Duplikált kód** - Helper függvények többször előfordulnak (pl. `isGuest`, `formatTimeAgo`)
5. **Típuskezelés** - Minden típus egy fájlban (types.ts)
6. **Vegyes felelősségek** - Service-ek túl sok mindent csinálnak

---

## 📐 Javasolt Új Mappastruktúra

```
chess-frontend/src/
├── core/                          # Új! Alapvető funkciók
│   ├── types/                     # Típusok domain szerint szervezve
│   │   ├── index.ts              # Re-export minden típusból
│   │   ├── game.types.ts         # Game, MoveHistoryType
│   │   ├── player.types.ts       # Player
│   │   ├── chess.types.ts        # Square, winReason
│   │   └── settings.types.ts     # GameSettings, UserSettings
│   ├── constants/                 # Új! Konstansok
│   │   ├── game.constants.ts     # DEFAULT_TIME, ELO_K_FACTOR, stb.
│   │   ├── ui.constants.ts       # AVATAR_OPTIONS, COLORS, stb.
│   │   └── index.ts
│   └── config/                    # Konfiguráció (jelenlegi firebase/)
│       └── firebase.config.ts
│
├── features/                      # Új! Feature-alapú szervezés
│   ├── game/                      # Sakk játék feature
│   │   ├── components/           # Játék-specifikus komponensek
│   │   │   ├── ChessBoard/       # Sakktábla modul
│   │   │   │   ├── ChessBoard.tsx
│   │   │   │   ├── ChessBoard.styles.ts
│   │   │   │   └── useBoardLogic.ts
│   │   │   ├── GameControls/     # Játékvezérlők
│   │   │   │   ├── GameControls.tsx
│   │   │   │   ├── DrawOfferButton.tsx
│   │   │   │   ├── SurrenderButton.tsx
│   │   │   │   └── AbortButton.tsx
│   │   │   ├── GameInfo/         # Játék információk
│   │   │   │   ├── PlayerInfo.tsx
│   │   │   │   ├── ChessClock.tsx
│   │   │   │   └── EloDisplay.tsx
│   │   │   └── MoveHistory/      # Lépéstörténet
│   │   │       ├── MoveHistory.tsx
│   │   │       ├── MoveList.tsx
│   │   │       └── HistoryNavigation.tsx
│   │   ├── hooks/                # Játék-specifikus hooks
│   │   │   ├── useChessGame.ts   # Főlogika kiszervezve ChessGame-ből
│   │   │   ├── useGameState.ts   # State management
│   │   │   ├── useGameActions.ts # Actions (move, surrender, stb.)
│   │   │   ├── useGameTimer.ts   # Időmérés logika
│   │   │   └── useMoveHistory.ts # Lépéstörténet kezelés
│   │   ├── services/             # Játék szolgáltatások
│   │   │   ├── game.service.ts   # Meglévő gameService
│   │   │   └── move.validator.ts # Lépés validáció
│   │   └── pages/                # Játék oldalak
│   │       ├── ChessGamePage.tsx # Jelenlegi ChessGame.tsx
│   │       └── ChessGameView.tsx
│   │
│   ├── lobby/                     # Lobby feature
│   │   ├── components/
│   │   │   ├── GameCard/         # Játékkártya komponens
│   │   │   │   ├── GameCard.tsx
│   │   │   │   ├── GameCardHeader.tsx
│   │   │   │   ├── GameCardPlayers.tsx
│   │   │   │   └── GameCardActions.tsx
│   │   │   ├── CreateGameModal/
│   │   │   │   └── CreateGameModal.tsx
│   │   │   └── GamesList/
│   │   │       ├── GamesList.tsx
│   │   │       ├── GamesGrid.tsx
│   │   │       └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useGamesSubscription.ts
│   │   │   └── useGameFilters.ts
│   │   └── pages/
│   │       └── LobbyPage.tsx     # Jelenlegi lobby.tsx
│   │
│   ├── history/                   # Játéktörténet feature
│   │   ├── components/
│   │   │   ├── GameHistoryCard/
│   │   │   ├── GameResultBadge/
│   │   │   └── PlayerStatsDropdown/
│   │   ├── hooks/
│   │   │   └── useGameHistory.ts
│   │   └── pages/
│   │       └── MyGamesPage.tsx   # Jelenlegi mygames.tsx
│   │
│   ├── leaderboard/              # Ranglista feature
│   │   ├── components/
│   │   │   ├── LeaderboardTable/
│   │   │   ├── PlayerRankCard/
│   │   │   └── FilterControls/
│   │   ├── hooks/
│   │   │   └── useLeaderboard.ts
│   │   └── pages/
│   │       └── LeaderboardPage.tsx
│   │
│   ├── settings/                 # Beállítások feature
│   │   ├── components/
│   │   │   ├── ProfileSettings/  # Profil beállítások
│   │   │   │   ├── ProfileSettings.tsx
│   │   │   │   ├── AvatarUpload.tsx
│   │   │   │   └── DisplayNameEdit.tsx
│   │   │   ├── GameSettings/     # Játék beállítások
│   │   │   │   ├── GameSettings.tsx
│   │   │   │   ├── BoardThemeSelector.tsx
│   │   │   │   └── SoundSettings.tsx
│   │   │   ├── NotificationSettings/
│   │   │   │   └── NotificationSettings.tsx
│   │   │   ├── PrivacySettings/
│   │   │   │   └── PrivacySettings.tsx
│   │   │   └── SecuritySettings/
│   │   │       ├── SecuritySettings.tsx
│   │   │       └── PasswordChange.tsx
│   │   ├── hooks/
│   │   │   ├── useUserSettings.ts
│   │   │   └── useAvatarUpload.ts
│   │   └── pages/
│   │       └── SettingsPage.tsx  # Jelenlegi settings.tsx (GeneralSettings)
│   │
│   ├── auth/                     # Autentikáció feature
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   │   └── LoginForm.tsx
│   │   │   └── RegisterForm/
│   │   │       └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts        # Meglévő
│   │   └── services/
│   │       └── auth.service.ts
│   │
│   └── chat/                     # Chat feature
│       ├── components/
│       │   ├── ChatBox/
│       │   │   ├── ChatBox.tsx
│       │   │   ├── MessageList.tsx
│       │   │   └── MessageInput.tsx
│       │   └── ChatBubble/
│       │       └── ChatBubble.tsx
│       └── hooks/
│           └── useChat.ts
│
├── shared/                        # Megosztott, újrahasználható elemek
│   ├── components/               # Közös UI komponensek
│   │   ├── Layout/
│   │   │   ├── Layout.tsx
│   │   │   └── Header.tsx
│   │   ├── Modal/                # Általános modal komponens
│   │   │   ├── Modal.tsx
│   │   │   └── ModalPortal.tsx
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.variants.ts
│   │   ├── LoadingSpinner/
│   │   │   └── LoadingSpinner.tsx
│   │   └── PlayerProfile/        # Újrahasználható profil komponens
│   │       ├── PlayerProfileModal.tsx
│   │       └── PlayerAvatar.tsx
│   ├── hooks/                    # Közös hooks
│   │   ├── useClickOutside.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── utils/                    # Új! Helper függvények
│   │   ├── date.utils.ts         # formatTimeAgo, stb.
│   │   ├── game.utils.ts         # isGuest, isFull, stb.
│   │   ├── elo.utils.ts          # ELO számítások
│   │   └── index.ts
│   └── services/                 # Közös szolgáltatások
│       ├── player.service.ts     # Meglévő
│       ├── user.service.ts       # Meglévő
│       ├── lichess.service.ts    # Meglévő
│       └── ai-game.service.ts    # Meglévő
│
├── pages/                        # Egyszerű root oldalak
│   ├── HomePage.tsx
│   └── TestPage.tsx
│
├── App.tsx
└── main.tsx
```

---

## 🔧 Részletes Refaktorálási Lépések

### 1️⃣ **ChessGame.tsx (613 sor) → Több kisebb komponens**

**Probléma:** Túl sok felelősség egy komponensben
- State management (15+ useState)
- Firebase listeners
- Játék logika
- UI rendering
- Event handlers

**Megoldás:**

```typescript
// ❌ ELŐTTE: Minden egy komponensben
export default function ChessGame() {
  // 50+ sor state deklaráció
  // 100+ sor useEffect hooks
  // 200+ sor event handlers
  // 100+ sor helper függvények
  // 100+ sor JSX
}

// ✅ UTÁNA: Szétbontva

// 1. Custom hook a játék logikához
// features/game/hooks/useChessGame.ts
export function useChessGame(gameId: string) {
  const { gameData, loading } = useGameState(gameId);
  const { makeMove, offerDraw, surrender, abort } = useGameActions(gameId);
  const { timeLeft, handleTimeExpired } = useGameTimer(gameData);
  const { moveHistory, viewMove, goToLatest } = useMoveHistory(gameData);

  return {
    gameData,
    loading,
    makeMove,
    offerDraw,
    surrender,
    abort,
    timeLeft,
    handleTimeExpired,
    moveHistory,
    viewMove,
    goToLatest
  };
}

// 2. Fő komponens egyszerűsítve
// features/game/pages/ChessGamePage.tsx
export default function ChessGamePage() {
  const { gameId } = useParams();
  const game = useChessGame(gameId);

  return (
    <ChessGameView
      game={game}
      onMove={game.makeMove}
      onSurrender={game.surrender}
      // ...
    />
  );
}

// 3. Nézet komponens tisztán presentational
// features/game/pages/ChessGameView.tsx
export function ChessGameView({ game, onMove, onSurrender, ... }) {
  return (
    <div>
      <GameInfo players={game.players} />
      <ChessBoard onMove={onMove} />
      <GameControls onSurrender={onSurrender} />
      <MoveHistory history={game.moveHistory} />
    </div>
  );
}
```

**Hook szétbontás:**

```typescript
// features/game/hooks/useGameState.ts
export function useGameState(gameId: string) {
  const [gameData, setGameData] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase subscription logika
  }, [gameId]);

  return { gameData, loading };
}

// features/game/hooks/useGameActions.ts
export function useGameActions(gameId: string) {
  const makeMove = useCallback((move) => {
    // Lépés logika
  }, [gameId]);

  const surrender = useCallback(() => {
    // Megadás logika
  }, [gameId]);

  return { makeMove, surrender, offerDraw, abort };
}

// features/game/hooks/useGameTimer.ts
export function useGameTimer(gameData: Game | null) {
  const [timeLeft, setTimeLeft] = useState({ white: 0, black: 0 });

  useEffect(() => {
    // Időszámítás logika
  }, [gameData]);

  return { timeLeft, handleTimeExpired };
}
```

---

### 2️⃣ **GeneralSettings.tsx (593 sor) → Feature modulokra bontás**

**Probléma:** Minden beállítás egy helyen

**Megoldás:**

```typescript
// ❌ ELŐTTE: Monolitikus komponens
export default function GeneralSettings() {
  // Avatar logika
  // Profil logika
  // Játék beállítások
  // Értesítések
  // Biztonság
  // stb...
}

// ✅ UTÁNA: Moduláris felépítés

// features/settings/pages/SettingsPage.tsx
export default function SettingsPage() {
  return (
    <SettingsLayout>
      <ProfileSettings />
      <GameSettings />
      <NotificationSettings />
      <PrivacySettings />
      <SecuritySettings />
    </SettingsLayout>
  );
}

// features/settings/components/ProfileSettings/ProfileSettings.tsx
export function ProfileSettings() {
  const { user, updateName } = useUserSettings();
  const { uploadAvatar, selectEmoji } = useAvatarUpload();

  return (
    <SettingsSection title="Profile">
      <AvatarUpload onUpload={uploadAvatar} onEmojiSelect={selectEmoji} />
      <DisplayNameEdit value={user.displayName} onSave={updateName} />
    </SettingsSection>
  );
}

// features/settings/components/GameSettings/GameSettings.tsx
export function GameSettings() {
  const { settings, updateSettings } = useUserSettings();

  return (
    <SettingsSection title="Game Preferences">
      <BoardThemeSelector
        value={settings.boardTheme}
        onChange={(theme) => updateSettings({ boardTheme: theme })}
      />
      <SoundSettings
        enabled={settings.soundEnabled}
        volume={settings.volume}
        onChange={updateSettings}
      />
    </SettingsSection>
  );
}
```

---

### 3️⃣ **lobby.tsx & mygames.tsx (800+ sor összesen) → Komponens szétbontás**

**Probléma:**
- Duplikált helper függvények (`isGuest`, `formatTimeAgo`)
- GameCard logika többször megismételve
- Nincs újrafelhasználhatóság

**Megoldás:**

```typescript
// ❌ ELŐTTE: Duplikált kód mindkét fájlban
// lobby.tsx
const isGuest = (player: any) => player?.uid?.startsWith("guest_");
const formatTimeAgo = (timestamp: number) => { /* ... */ };

// mygames.tsx
const isGuest = (player: any) => player?.uid?.startsWith("guest_");
const formatTimeAgo = (timestamp: number) => { /* ... */ };

// ✅ UTÁNA: Közös utils

// shared/utils/game.utils.ts
export function isGuest(player: Player): boolean {
  return player?.uid?.startsWith("guest_");
}

export function isFull(game: Game): boolean {
  return Boolean(game.players?.white && game.players?.black);
}

// shared/utils/date.utils.ts
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

// Újrafelhasználható GameCard komponens
// shared/components/GameCard/GameCard.tsx
export function GameCard({ game, currentUser, onJoin, onClick }) {
  return (
    <div className="game-card" onClick={onClick}>
      <GameCardHeader game={game} />
      <GameCardPlayers
        game={game}
        currentUser={currentUser}
        onPlayerClick={handlePlayerClick}
      />
      <GameCardActions game={game} onJoin={onJoin} />
    </div>
  );
}

// features/lobby/pages/LobbyPage.tsx
export default function LobbyPage() {
  const { games, loading } = useGamesSubscription({
    filter: ['waiting', 'ongoing']
  });

  return (
    <GamesGrid>
      {games.map(game => (
        <GameCard
          key={game.id}
          game={game}
          currentUser={currentUser}
          onJoin={handleJoin}
        />
      ))}
    </GamesGrid>
  );
}
```

---

### 4️⃣ **types.ts → Domain alapú szervezés**

**Probléma:** Minden típus egy fájlban

**Megoldás:**

```typescript
// ❌ ELŐTTE: types.ts (minden együtt)
export type Square = "a1" | "a2" | ...;
export type winReason = "checkmate" | ...;
export type Player = { ... };
export type Game = { ... };

// ✅ UTÁNA: Domain szerint szétválasztva

// core/types/chess.types.ts
export type Square = "a1" | "a2" | ...;
export type winReason = "checkmate" | "timeout" | ...;

// core/types/player.types.ts
export interface Player {
  uid: string;
  name?: string;
  displayName: string | null;
  email: string | null;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

// core/types/game.types.ts
export interface Game {
  fen: string;
  moves: MoveHistoryType[];
  players: { white: Player; black: Player } | null;
  status: GameStatus;
  winner: GameWinner | null;
  // ...
}

export type GameStatus = "waiting" | "ongoing" | "ended";
export type GameWinner = "white" | "black" | "draw";

// core/types/index.ts (re-export minden típust)
export * from './chess.types';
export * from './player.types';
export * from './game.types';
export * from './settings.types';
```

---

### 5️⃣ **Services szétbontása és specializálása**

**Jelenlegi:**
- gameService.ts: Sok felelősség
- lichessService.ts: Túl nagy (496 sor)

**Javasolt:**

```typescript
// features/game/services/game.service.ts
export class GameService {
  createNewGame(gameId: string, settings?: GameSettings): Promise<void>
  updateGameState(gameId: string, move: Move): Promise<void>
  endGame(gameId: string, winner: GameWinner): Promise<void>
}

// features/game/services/move.validator.ts
export class MoveValidator {
  validateMove(game: Chess, move: Move): boolean
  canPlayerMove(player: Player, game: Game): boolean
}

// shared/utils/elo.utils.ts (ELO számítások kiszervezése)
export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  isDraw: boolean = false
): { winnerChange: number; loserChange: number }

// features/game/services/game-timer.service.ts
export class GameTimerService {
  calculateRemainingTime(game: Game, side: 'white' | 'black'): number
  updateTimersOnMove(game: Game, move: Move): TimeLeft
}
```

---

### 6️⃣ **Konstansok kiemelése**

```typescript
// core/constants/game.constants.ts
export const DEFAULT_TIME_CONTROL = 5; // minutes
export const DEFAULT_INCREMENT = 0; // seconds
export const ELO_K_FACTOR = 32;
export const DEFAULT_ELO = 1200;
export const MAX_MOVE_HISTORY_DISPLAY = 50;

// core/constants/ui.constants.ts
export const AVATAR_OPTIONS = [
  "👤", "🧑", "👨", "👩", "🧔", "👨‍💼", "👩‍💼",
  "👨‍🎓", "👩‍🎓", "🤴", "👸", "🦸", "🦹", "🧙",
  "🧝", "🧛", "🧟", "🤖", "👽"
];

export const DEFAULT_AVATAR = "emoji:👤";

export const BOARD_THEMES = {
  classic: { light: '#f0d9b5', dark: '#b58863' },
  modern: { light: '#e8e8e8', dark: '#4a4a4a' },
  // ...
};

// core/constants/firebase.constants.ts
export const COLLECTIONS = {
  USERS: 'users',
  GAMES: 'games',
  CHAT: 'chat',
} as const;

export const DB_PATHS = {
  game: (gameId: string) => `games/${gameId}`,
  user: (userId: string) => `users/${userId}`,
  chat: (gameId: string) => `chat/${gameId}`,
} as const;
```

---

## 📊 Refaktorálás Előnyei

### Kódminőség
- ✅ **Kisebb fájlok**: 100-200 sor/komponens (jelenleg 600+)
- ✅ **Egyértelmű felelősségek**: Egy komponens = egy felelősség
- ✅ **Újrafelhasználhatóság**: Megosztott komponensek és utils
- ✅ **Könnyebb tesztelés**: Kisebb, izolált egységek

### Karbantarthatóság
- ✅ **Könnyebb navigáció**: Feature-alapú mappastruktúra
- ✅ **Gyorsabb fejlesztés**: Világos, hogy hova kerül az új kód
- ✅ **Kevesebb merge conflict**: Kisebb fájlok
- ✅ **Jobb onboarding**: Új fejlesztők gyorsabban megértik

### Teljesítmény
- ✅ **Lazy loading**: Feature-ok betöltése igény szerint
- ✅ **Code splitting**: Kisebb bundle méret
- ✅ **Memo optimalizáció**: Kisebb komponensek könnyebben optimalizálhatók

---

## 🚀 Implementálási Sorrend (Prioritás szerint)

### Fázis 1: Alapok (1-2 hét)
1. ✅ Mappastruktúra létrehozása
2. ✅ Típusok átszervezése (`core/types/`)
3. ✅ Konstansok kiemelése (`core/constants/`)
4. ✅ Utils létrehozása (`shared/utils/`)

### Fázis 2: Komponensek (2-3 hét)
5. ✅ ChessGame szétbontása hooks-okra
6. ✅ GeneralSettings szétbontása modulokra
7. ✅ Lobby és MyGames refaktorálása
8. ✅ Közös komponensek kiemelése (GameCard, Modal, stb.)

### Fázis 3: Services (1 hét)
9. ✅ Service-ek átszervezése feature-ök szerint
10. ✅ ELO számítások utils-ba kiemelése

### Fázis 4: Finomhangolás (1 hét)
11. ✅ Tesztelés
12. ✅ Dokumentáció frissítése
13. ✅ Performance optimalizáció

---

## ⚠️ Figyelmeztetések

- **Ne sürgessük!** A refaktorálást fokozatosan, kis lépésekben végezzük
- **Tesztelés**: Minden lépés után teszteljük, hogy nem tört-e el valami
- **Verziókezelés**: Gyakori commit-ok, értelmes üzenetekkel
- **Backward compatibility**: Fokozatos migráció, hogy a meglévő kód működjön

---

## 📝 További Javaslatok

1. **Storybook bevezetése**: UI komponensek dokumentálása és tesztelése
2. **Unit tesztek**: Különösen a utils és hooks-okra
3. **ESLint szabályok**: Mappastruktúra betartatása
4. **Barrel exports**: `index.ts` fájlok használata clean import-okhoz
5. **TypeScript strict mode**: Típusbiztonság növelése

---

## 📈 Jelenlegi Kódbázis Statisztika

### Legnagyobb fájlok (sorok szerint):
- ChessGame.tsx: **613 sor**
- GeneralSettings.tsx: **593 sor**
- lichessService.ts: **496 sor**
- mygames.tsx: **464 sor**
- lobby.tsx: **412 sor**
- gameService.ts: **372 sor**
- ChessGameView.tsx: **313 sor**
- GameEndModal.tsx: **310 sor**

### Duplikált kód példák:
- `isGuest()` - 2x (lobby.tsx, mygames.tsx)
- `formatTimeAgo()` - 2x (lobby.tsx, mygames.tsx)
- GameCard UI logika - 2x (különböző megjelenítéssel)
- Player display name fallback logika - 4x

---

## 🎯 Várható Eredmények

A refaktorálás után:
- **Átlagos fájlméret**: 100-200 sor (600+ helyett)
- **Duplikáció**: ~0% (jelenleg ~15-20%)
- **Tesztlefedettség**: 60%+ (jelenleg 0%)
- **Bundle méret**: -15-20% (code splitting)
- **Fejlesztési idő**: -30% (jobb struktúra)

---

**Készítette:** Claude
**Utolsó frissítés:** 2025-11-28
