# 🤖 Refaktorálási Prompt - Agent számára

> **Használat:** Add meg ezt a promptot az agentnek a refaktorálás végrehajtásához

---

## 📋 Prompt

```
Kérlek, hajtsd végre a ChessApp kódbázis refaktorálását a REFACTORING_PLAN.md
alapján. A refaktorálást fokozatosan, fázisokra bontva végezd el az alábbi
irányelvek szerint:

## Általános Irányelvek

1. **Fokozatos megközelítés**: Ne próbálj meg mindent egyszerre megcsinálni
2. **Tesztelés**: Minden nagyobb változtatás után ellenőrizd, hogy nem tört-e el semmi
3. **Gyakori commit-ok**: Minden logikai egységet külön commitolj
4. **Backward compatibility**: A meglévő kód továbbra is működjön a refaktorálás során

## Fázis 1: Alapok (Kezdd ezzel!)

### 1.1 Mappastruktúra létrehozása
- Hozd létre az új mappastruktúrát:
  - `src/core/types/`
  - `src/core/constants/`
  - `src/core/config/`
  - `src/features/` (és alkönyvtárak)
  - `src/shared/utils/`
  - `src/shared/components/`
  - `src/shared/hooks/`

### 1.2 Típusok átszervezése
- Oszd szét a `src/types.ts` fájlt domain szerint:
  - `core/types/chess.types.ts` - Square, winReason
  - `core/types/player.types.ts` - Player
  - `core/types/game.types.ts` - Game, MoveHistoryType, GameStatus
  - `core/types/settings.types.ts` - GameSettings, UserSettings
  - `core/types/index.ts` - Re-export minden típust

- Frissítsd az import-okat az összes fájlban:
  - `import type { Player } from '../types'` → `import type { Player } from '@/core/types'`
  - Használj path alias-t ha lehetséges (tsconfig.json)

**Commit:** "refactor(types): reorganize types by domain"

### 1.3 Konstansok kiemelése
- Hozd létre a konstans fájlokat:
  - `core/constants/game.constants.ts`:
    ```typescript
    export const DEFAULT_TIME_CONTROL = 5;
    export const DEFAULT_INCREMENT = 0;
    export const ELO_K_FACTOR = 32;
    export const DEFAULT_ELO = 1200;
    ```

  - `core/constants/ui.constants.ts`:
    ```typescript
    export const AVATAR_OPTIONS = ["👤", "🧑", ...];
    export const DEFAULT_AVATAR = "emoji:👤";
    export const BOARD_THEMES = { ... };
    ```

- Cseréld le a hardcoded értékeket ezekre a konstansokra

**Commit:** "refactor(constants): extract constants to separate files"

### 1.4 Utils létrehozása
- Hozd létre a helper függvényeket:
  - `shared/utils/game.utils.ts`:
    ```typescript
    export function isGuest(player: Player): boolean
    export function isFull(game: Game): boolean
    export function getPlayerSide(user, game): 'white' | 'black' | null
    ```

  - `shared/utils/date.utils.ts`:
    ```typescript
    export function formatTimeAgo(timestamp: number): string
    ```

  - `shared/utils/elo.utils.ts`:
    ```typescript
    export function calculateEloChange(...)
    ```

- Cseréld le a duplikált kódokat ezekre a utils függvényekre:
  - `lobby.tsx` és `mygames.tsx`-ben lévő `isGuest`, `formatTimeAgo`

**Commit:** "refactor(utils): extract shared utility functions"

## Fázis 2: Komponensek (Csak ha az Fázis 1 kész!)

### 2.1 ChessGame refaktorálás
- Hozd létre a hooks-okat:
  - `features/game/hooks/useGameState.ts` - Firebase listener és state
  - `features/game/hooks/useGameActions.ts` - Move, surrender, draw actions
  - `features/game/hooks/useGameTimer.ts` - Timer logika
  - `features/game/hooks/useMoveHistory.ts` - History navigation
  - `features/game/hooks/useChessGame.ts` - Főhook, összeköti a többit

- Refaktoráld a komponenst:
  - `features/game/pages/ChessGamePage.tsx` - Smart komponens (hooks)
  - `features/game/pages/ChessGameView.tsx` - Presentational komponens (UI)

- Frissítsd a route-okat az App.tsx-ben

**Commit minden hook után külön:**
- "refactor(game): extract game state logic to useGameState hook"
- "refactor(game): extract game actions to useGameActions hook"
- "refactor(game): extract timer logic to useGameTimer hook"
- "refactor(game): split ChessGame into page and view components"

### 2.2 GeneralSettings refaktorálás
- Hozd létre a komponenseket:
  - `features/settings/components/ProfileSettings/`
  - `features/settings/components/GameSettings/`
  - `features/settings/components/NotificationSettings/`
  - `features/settings/components/SecuritySettings/`

- Hozd létre a hooks-okat:
  - `features/settings/hooks/useUserSettings.ts`
  - `features/settings/hooks/useAvatarUpload.ts`

- Főoldal:
  - `features/settings/pages/SettingsPage.tsx`

**Commit minden modul után külön:**
- "refactor(settings): extract ProfileSettings component"
- "refactor(settings): extract GameSettings component"
- stb.

### 2.3 Lobby és MyGames refaktorálás
- Hozd létre a közös komponenseket:
  - `shared/components/GameCard/GameCard.tsx`
  - `shared/components/GameCard/GameCardHeader.tsx`
  - `shared/components/GameCard/GameCardPlayers.tsx`
  - `shared/components/GameCard/GameCardActions.tsx`

- Refaktoráld az oldalakat:
  - `features/lobby/pages/LobbyPage.tsx`
  - `features/history/pages/MyGamesPage.tsx`

- Használd az előbb létrehozott utils-okat (isGuest, formatTimeAgo)

**Commit:**
- "refactor(shared): create reusable GameCard component"
- "refactor(lobby): migrate to feature-based structure"
- "refactor(history): migrate MyGames to feature-based structure"

## Fázis 3: Services (Csak ha Fázis 2 kész!)

### 3.1 Service-ek átszervezése
- Mozgasd át a service-eket:
  - `src/services/gameService.ts` → `features/game/services/game.service.ts`
  - `src/services/playerService.ts` → `shared/services/player.service.ts`
  - `src/services/aiGameService.ts` → `shared/services/ai-game.service.ts`
  - `src/services/lichessService.ts` → `shared/services/lichess.service.ts`
  - `src/services/userService.ts` → `shared/services/user.service.ts`

- Frissítsd az import-okat minden fájlban

**Commit:**
- "refactor(services): reorganize services by feature"

### 3.2 ELO számítások kiemelése
- Mozgasd a `calculateEloChange` függvényt:
  - `gameService.ts` → `shared/utils/elo.utils.ts`

- Importáld be a gameService-be a utils-ból

**Commit:**
- "refactor(elo): extract ELO calculations to utility"

## Fázis 4: Finomhangolás (Csak ha Fázis 3 kész!)

### 4.1 Import-ok tisztítása
- Ellenőrizd, hogy minden import helyes-e
- Használj barrel exports-ot (`index.ts` fájlokat)
- Állíts be path alias-okat a tsconfig.json-ban:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/core/*": ["./src/core/*"],
        "@/features/*": ["./src/features/*"],
        "@/shared/*": ["./src/shared/*"]
      }
    }
  }
  ```

**Commit:**
- "refactor(imports): clean up imports and add path aliases"

### 4.2 Töröld az elavult fájlokat
- Töröld a régi fájlokat, amik már át lettek költöztetve:
  - `src/types.ts` (ha minden átköltözött)
  - `src/ChessGame.tsx` (ha átköltözött)
  - `src/components/GeneralSettings.tsx` (ha átköltözött)
  - stb.

**FONTOS:** Csak akkor törölj, ha biztos vagy benne, hogy minden működik!

**Commit:**
- "refactor(cleanup): remove deprecated files"

### 4.3 Dokumentáció frissítése
- Frissítsd a `KÓDBÁZIS_DOKUMENTÁCIÓ.md`-t az új struktúrával
- Adj hozzá README.md fájlokat a feature könyvtárakba

**Commit:**
- "docs: update documentation with new structure"

## Tesztelési Checklist (Minden fázis után!)

Ellenőrizd, hogy:
- [ ] Az app buildelődik (`npm run build`)
- [ ] Nincsenek TypeScript hibák
- [ ] A dev server elindul (`npm run dev`)
- [ ] A főbb funkciók működnek:
  - [ ] Bejelentkezés
  - [ ] Játék létrehozása
  - [ ] Csatlakozás játékhoz
  - [ ] Lépés végrehajtása
  - [ ] Lobby megtekintése
  - [ ] Játéktörténet megtekintése
  - [ ] Beállítások módosítása

## Commit Üzenet Konvenció

Használd a következő formátumot:
```
<type>(<scope>): <subject>

<body>
```

Példák:
- `refactor(types): reorganize types by domain`
- `refactor(game): extract game state to custom hook`
- `feat(shared): add reusable GameCard component`
- `fix(lobby): correct import paths after refactor`

## Veszélyes Műveletek (CSAK FIGYELMESEN!)

- ❌ NE törölj fájlokat addig, amíg nem vagy biztos, hogy minden működik
- ❌ NE változtass Firebase sémán vagy API-kon
- ❌ NE módosítsd az üzleti logikát, csak a struktúrát
- ✅ COMMIT-olj gyakran
- ✅ TESZTELJ minden változtatás után
- ✅ HALADJ fokozatosan, fázisról fázisra

## Ha elakadtál

1. Commit-old amit eddig csináltál
2. Írd le pontosan, hogy mi a probléma
3. Kérj segítséget, küldd el a hibaüzenetet
4. Ha szükséges, térj vissza az előző működő állapotra: `git reset --hard HEAD`

## Sikerkritériumok

A refaktorálás akkor sikeres, ha:
- ✅ Minden fájl < 300 sor
- ✅ Nincs duplikált kód
- ✅ Feature-alapú struktúra
- ✅ Tiszta import-ok
- ✅ Minden funkció működik
- ✅ Build sikeres
- ✅ Nincs TypeScript hiba

Kezdd el az Fázis 1-gyel, és haladj fokozatosan!
```

---

## 🎯 Használat

1. Másold ki a fenti promptot
2. Add meg az agentnek
3. Az agent végigmegy a fázisokon
4. Ellenőrizd minden fázis után az eredményt

---

**Megjegyzés:** Ez a prompt részletes, lépésről-lépésre útmutatást ad az agent számára.
Ha túl hosszúnak találod, kezdheted csak az "Fázis 1"-gyel, és folytathatod később a többivel.
