# Lichess API Service Dokumentáció

Ez a service lehetővé teszi a Lichess.org API használatát AI elleni játékhoz és egyéb funkciókhoz.

## Első lépések

### 1. API Token beszerzése

1. Menj a Lichess-re: https://lichess.org/account/oauth/token
2. Hozz létre egy új Personal API Access Token-t
3. Add meg a következő jogosultságokat:
   - **Board: Play games with the board API** (szükséges)
   - Challenge:create (opcionális)
   - Challenge:read (opcionális)

### 2. Token beállítása

```typescript
import { lichessService } from './services/lichessService';

// Token beállítása (ezt csak egyszer kell megtenni)
lichessService.setToken('lip_xxxxxxxxxxxxxxxxxx');
```

## Alapvető használat

### AI játék indítása

```typescript
import { lichessService } from './services/lichessService';
import type { LichessAILevel } from './services/lichessService';

// Token beállítása
lichessService.setToken('lip_xxxxxxxxxxxxxxxxxx');

// AI kihívása
const challenge = await lichessService.challengeAI(
  4,        // Nehézségi szint (1-8)
  'random', // Szín választás ('white', 'black', 'random')
  { limit: 300, increment: 3 } // Opcionális: 5 perc + 3 mp increment
);

console.log('Játék URL:', challenge.url);
console.log('Játék ID:', challenge.id);
console.log('Te vagy:', challenge.color);
```

### AI nehézségi szintek

- **1-2**: Kezdő
- **3-4**: Közepes
- **5-6**: Haladó
- **7-8**: Expert

### Játék állapot figyelése

```typescript
const gameId = challenge.id;

const closeStream = lichessService.streamGameState(
  gameId,
  (state) => {
    console.log('Játék állapot:', state);
    console.log('FEN:', state.fen);
    console.log('Lépések:', state.moves);
    console.log('Játék státusz:', state.status);
    
    if (state.status === 'mate') {
      console.log('Matt! Győztes:', state.winner);
    }
  },
  (fullGame) => {
    console.log('Teljes játék adat:', fullGame);
  }
);

// Később, amikor már nincs szükség a streamre:
// closeStream();
```

### Lépés végrehajtása

```typescript
import { Chess } from 'chess.js';

const chess = new Chess();
// ... játékos lép a táblán

const move = chess.history({ verbose: true }).pop();
if (move) {
  const uciMove = `${move.from}${move.to}${move.promotion || ''}`;
  
  await lichessService.makeMove(gameId, uciMove);
}
```

### Játék befejezése

```typescript
// Feladás
await lichessService.resign(gameId);

// Játék megszakítása (csak az első pár lépésben)
await lichessService.abort(gameId);

// Döntetlen ajánlat kezelése
await lichessService.handleDrawOffer(gameId, true);  // Elfogadás
await lichessService.handleDrawOffer(gameId, false); // Elutasítás
```

## Teljes példa komponens

```tsx
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { lichessService } from './services/lichessService';
import type { LichessAILevel } from './services/lichessService';

function LichessAIGame() {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Token beállítása környezeti változóból vagy config-ból
    const token = import.meta.env.VITE_LICHESS_TOKEN || '';
    if (token) {
      lichessService.setToken(token);
    }

    return () => {
      lichessService.cleanup();
    };
  }, []);

  const startGame = async (level: LichessAILevel) => {
    setIsStarting(true);
    try {
      // AI kihívása
      const challenge = await lichessService.challengeAI(level, 'random', {
        limit: 600,
        increment: 5,
      });

      setGameId(challenge.id);
      setPlayerColor(challenge.color);
      
      // Játék állapot figyelése
      lichessService.streamGameState(
        challenge.id,
        (state) => {
          // Lépések alkalmazása
          if (state.moves) {
            const moves = lichessService.parseMoves(state.moves);
            chess.reset();
            moves.forEach((move) => {
              chess.move({
                from: move.substring(0, 2),
                to: move.substring(2, 4),
                promotion: move.length > 4 ? move[4] : undefined,
              });
            });
            setFen(chess.fen());
          }

          setGameStatus(state.status);

          // Játék vége
          if (state.status === 'mate' || state.status === 'resign') {
            console.log('Játék vége! Győztes:', state.winner);
          }
        },
        (fullGame) => {
          console.log('Játék elindult:', fullGame);
        }
      );

      // Lichess oldalon is megnyitható
      window.open(challenge.url, '_blank');
    } catch (error) {
      console.error('Hiba játék indításakor:', error);
      alert('Nem sikerült játékot indítani. Ellenőrizd a tokent!');
    } finally {
      setIsStarting(false);
    }
  };

  const onDrop = async (sourceSquare: string, targetSquare: string) => {
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;

      setFen(chess.fen());

      // Lépés küldése Lichess-nek
      if (gameId) {
        const uciMove = `${move.from}${move.to}${move.promotion || ''}`;
        await lichessService.makeMove(gameId, uciMove);
      }

      return true;
    } catch (error) {
      console.error('Érvénytelen lépés:', error);
      return false;
    }
  };

  const handleResign = async () => {
    if (gameId && window.confirm('Biztosan feladod?')) {
      await lichessService.resign(gameId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Lichess AI Játék</h1>

      {!gameId ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg mb-2">Válassz nehézségi szintet:</h2>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
            <button
              key={level}
              onClick={() => startGame(level as LichessAILevel)}
              disabled={isStarting || !lichessService.hasToken()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {lichessService.getLevelDescription(level as LichessAILevel)} (Szint {level})
            </button>
          ))}
          {!lichessService.hasToken() && (
            <p className="text-red-500 text-sm mt-2">
              Állítsd be a Lichess API tokent!
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="text-center">
            <p>Játék ID: {gameId}</p>
            <p>Te játszol: {playerColor === 'white' ? 'Világos' : 'Sötét'}</p>
            <p>Státusz: {gameStatus}</p>
          </div>

          <div className="w-full max-w-[600px]">
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={playerColor}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleResign}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Feladás
            </button>
            <a
              href={`https://lichess.org/${gameId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Megnyitás Lichess-en
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default LichessAIGame;
```

## API Token környezeti változóként

Hozz létre egy `.env` fájlt:

```env
VITE_LICHESS_TOKEN=lip_xxxxxxxxxxxxxxxxxx
```

Használat:

```typescript
const token = import.meta.env.VITE_LICHESS_TOKEN;
lichessService.setToken(token);
```

## Egyéb funkciók

### Folyamatban lévő játékok lekérése

```typescript
const games = await lichessService.getOngoingGames();
console.log('Folyamatban lévő játékok:', games);
```

### Játék adatok lekérése

```typescript
const game = await lichessService.getGame(gameId);
console.log('Játék:', game);
```

### Cloud értékelés (ingyenes, nincs token szükséges)

```typescript
const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const evaluation = await lichessService.getCloudEvaluation(fen, 3);
console.log('Értékelés:', evaluation);

// Legjobb lépés
const bestMove = await lichessService.getBestMove(fen);
console.log('Legjobb lépés:', bestMove);
```

## Hibakezelés

```typescript
try {
  await lichessService.challengeAI(5, 'white');
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Érvénytelen API token!');
  } else if (error.message.includes('429')) {
    console.error('Túl sok kérés, várj egy kicsit!');
  } else {
    console.error('Hiba:', error);
  }
}
```

## Fontos megjegyzések

1. **Rate limiting**: A Lichess API korlátozza a kérések számát. Ne spammeld!
2. **Token biztonság**: Ne commit-old a tokent! Használj környezeti változót!
3. **EventSource támogatás**: A stream funkció EventSource-ot használ, ami nem minden böngészőben támogatott régi verziókon
4. **Cleanup**: Mindig hívd meg a `cleanup()` metódust, amikor már nincs szükség a service-re
5. **CORS**: A Lichess API támogatja a CORS-t, úgyhogy böngészőből is használható

## További információk

- Lichess API dokumentáció: https://lichess.org/api
- Token generálás: https://lichess.org/account/oauth/token
- Board API: https://lichess.org/api#tag/Board
