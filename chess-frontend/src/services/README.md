# Chess Services Documentation

Ez a mappa tartalmazza az összes service-t, amelyek a sakk játék különböző funkcióit kezelik.

## 📁 Services Áttekintés

### 1. **gameService.ts** - Általános Játék Logika
Kezeli a játék alapvető műveleteit és Firebase integrációt.

**Főbb funkciók:**
- `createNewGame()` - Új játék létrehozása
- `updateGameInDb()` - Játék állapot frissítése lépés után
- `calculateEloChange()` - ELO számítás
- `updateFirestoreOnGameEnd()` - Firestore frissítés játék végén
- `offerDraw()` / `acceptDraw()` / `declineDraw()` - Döntetlen kezelés
- `surrenderGame()` - Feladás
- `abortGame()` - Megszakítás
- `handleTimeout()` - Időtúllépés kezelés

**Példa használat:**
```typescript
import { gameService } from './services';

// Új játék létrehozása
await gameService.createNewGame('game123', {
  timeControl: 10,
  increment: 5,
  opponentType: 'human'
});

// Lépés frissítése
const eloChanges = await gameService.updateGameInDb(
  'game123',
  gameData,
  chessGame,
  newFen,
  move
);
```

---

### 2. **aiGameService.ts** - AI Elleni Játék
Kezeli az AI elleni játékokat a Lichess API-n keresztül.

**Főbb funkciók:**
- `startAIGame()` - AI játék indítása Lichess-en
- `streamAIGameState()` - Valós idejű game state stream
- `makeAIMove()` - Lépés küldése AI-nak
- `getHint()` - Segítség kérése (legjobb lépés)
- `resignAIGame()` - Feladás AI ellen
- `abortAIGame()` - Megszakítás
- `cleanupGame()` - Erőforrások felszabadítása

**Példa használat:**
```typescript
import { aiGameService, type LichessAILevel } from './services';

// Token inicializálás (csak egyszer, az app indulásakor)
aiGameService.initializeLichess(import.meta.env.VITE_LICHESS_TOKEN);

// AI játék indítása
const { lichessGameId, lichessUrl, assignedColor } = await aiGameService.startAIGame(
  'game123',
  4, // Nehézségi szint (1-8)
  'random', // Szín választás
  { limit: 600, increment: 5 } // 10 perc + 5 mp
);

// Game state stream
const cleanup = aiGameService.streamAIGameState(
  'game123',
  lichessGameId,
  (uciMove, fen) => {
    console.log('AI lépett:', uciMove);
    // Frissítsd a helyi játékot
  }
);

// Lépés küldése AI-nak
await aiGameService.makeAIMove('game123', 'e2e4');

// Cleanup (komponens unmount-kor)
cleanup();
aiGameService.cleanupGame('game123');
```

---

### 3. **playerService.ts** - Játékos Kezelés
Kezeli a játékosokkal kapcsolatos műveleteket.

**Főbb funkciók:**
- `joinGame()` - Játékhoz csatlakozás
- `getPlayerSide()` - Játékos oldalának lekérdezése
- `isPlayer()` - Játékos vagy néző?
- `getPlayerData()` - Játékos adatok Firestore-ból
- `bothPlayersJoined()` - Mindkét játékos csatlakozott?
- `getOpponent()` - Ellenfél adatai
- `getRemainingTime()` - Hátralévő idő számítás

**Példa használat:**
```typescript
import { playerService } from './services';

// Játékhoz csatlakozás
const side = await playerService.joinGame('game123', user, gameData);
console.log('Csatlakoztál mint:', side); // 'white' vagy 'black'

// Saját oldal lekérdezése
const mySide = playerService.getPlayerSide(user, gameData);

// Játékos vagy?
const isPlayer = playerService.isPlayer(user, gameData);

// Ellenfél adatai
const opponent = playerService.getOpponent(user, gameData);

// Hátralévő idő
const timeLeft = playerService.getRemainingTime('white', gameData, currentTurn);
```

---

### 4. **lichessService.tsx** - Lichess API Integráció
Közvetlen Lichess API hívások.

**Főbb funkciók:**
- `setToken()` - Token beállítása
- `challengeAI()` - AI kihívása
- `makeMove()` - Lépés küldése
- `streamGameState()` - Real-time game stream
- `getCloudEvaluation()` - Cloud értékelés
- `getBestMove()` - Legjobb lépés lekérése
- `resign()` / `abort()` - Feladás/Megszakítás
- `handleDrawOffer()` - Döntetlen kezelés

**Példa használat:**
```typescript
import { lichessService } from './services';

// Token beállítása
lichessService.setToken('lip_xxxxxxxxxx');

// AI kihívása
const challenge = await lichessService.challengeAI(5, 'white', {
  limit: 300,
  increment: 3
});

// Cloud értékelés (ingyenes, token nélkül!)
const evaluation = await lichessService.getCloudEvaluation(fen, 1);
const bestMove = await lichessService.getBestMove(fen);
```

---

## 🎯 Használati Minták

### AI Elleni Játék Teljes Flow

```typescript
import { aiGameService, gameService, playerService } from './services';

// 1. Inicializálás
aiGameService.initializeLichess(import.meta.env.VITE_LICHESS_TOKEN);

// 2. Játék létrehozása Firebase-ben
await gameService.createNewGame('game123', {
  timeControl: 10,
  increment: 5,
  opponentType: 'ai'
});

// 3. AI játék indítása Lichess-en
const { lichessGameId, assignedColor } = await aiGameService.startAIGame(
  'game123',
  4,
  'random',
  { limit: 600, increment: 5 }
);

// 4. Game state stream
const cleanup = aiGameService.streamAIGameState(
  'game123',
  lichessGameId,
  async (uciMove, fen) => {
    // AI lépett
    const move = aiGameService.applyUciMove(chessGame, uciMove);
    if (move) {
      // Frissítsd Firebase-t
      await gameService.updateGameInDb('game123', gameData, chessGame, fen, move);
    }
  }
);

// 5. Játékos lép
async function onPlayerMove(sourceSquare: string, targetSquare: string) {
  const move = chessGame.move({ from: sourceSquare, to: targetSquare });
  if (!move) return false;

  // Frissítsd Firebase-t
  await gameService.updateGameInDb('game123', gameData, chessGame, chessGame.fen(), move);

  // Küldd el Lichess-nek
  const uciMove = `${move.from}${move.to}${move.promotion || ''}`;
  await aiGameService.makeAIMove('game123', uciMove);

  return true;
}

// 6. Cleanup (komponens unmount)
useEffect(() => {
  return () => {
    cleanup();
    aiGameService.cleanupGame('game123');
  };
}, []);
```

---

## 🚀 Best Practices

### 1. Service Inicializálás
```typescript
// App.tsx vagy hasonló high-level komponens
useEffect(() => {
  // Lichess token inicializálás egyszer
  const token = import.meta.env.VITE_LICHESS_TOKEN;
  if (token) {
    aiGameService.initializeLichess(token);
  }
}, []);
```

### 2. Cleanup Kezelés
```typescript
useEffect(() => {
  // Setup
  const cleanup = aiGameService.streamAIGameState(...);

  // Cleanup
  return () => {
    cleanup();
    aiGameService.cleanupGame(gameId);
  };
}, [gameId]);
```

### 3. Error Handling
```typescript
try {
  await aiGameService.startAIGame(...);
} catch (error) {
  console.error('AI game error:', error);
  // Fallback vagy user notification
}
```

### 4. Singleton Pattern
Minden service singleton, ezért bárhonnan importálhatod:
```typescript
import { gameService, aiGameService, playerService } from './services';
```

---

## 📝 Megjegyzések

- **AI játék**: Lichess token szükséges (`.env` fájlban: `VITE_LICHESS_TOKEN`)
- **ELO számítás**: K-faktor = 32 (szokásos chess.com érték)
- **Időkezelés**: Milliszekundumban tároljuk, de a modal percben kéri
- **Firebase**: Realtime Database a játék állapothoz, Firestore a user profilokhoz
- **Cleanup**: Mindig hívd meg a cleanup függvényeket komponens unmount-kor!

---

## 🔧 Troubleshooting

### "Lichess API token not set"
```typescript
// Állítsd be a tokent
aiGameService.initializeLichess(import.meta.env.VITE_LICHESS_TOKEN);
```

### "No active Lichess game for this game ID"
```typescript
// Előbb indítsd el az AI játékot
await aiGameService.startAIGame(gameId, level, color);
```

### AI nem lép
```typescript
// Ellenőrizd a stream-et
console.log('Is AI game?', aiGameService.isAIGame(gameId));
console.log('Lichess game ID:', aiGameService.getLichessGameId(gameId));
```

---

**Készítve:** 2025-10-17  
**Verzió:** 1.0
