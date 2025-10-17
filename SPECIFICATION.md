# 📋 ChessApp - Teljes Műszaki Specifikáció

## 📖 Tartalomjegyzék
- [1. Projekt Áttekintés](#1-projekt-áttekintés)
  - [1.1 Projekt Neve](#11-projekt-neve)
  - [1.2 Verzió](#12-verzió)
  - [1.3 Cél](#13-cél)
  - [1.4 Célközönség](#14-célközönség)
- [2. A Rendszer Célja, Funkciói és Környezete](#2-a-rendszer-célja-funkciói-és-környezete)
  - [2.1 Feladatkiírás](#21-feladatkiírás)
  - [2.2 A Rendszer által Biztosítandó Tipikus Funkciók](#22-a-rendszer-által-biztosítandó-tipikus-funkciók)
  - [2.3 A Program Környezete](#23-a-program-környezete)
- [3. Technológiai Stack](#3-technológiai-stack)
- [4. Megvalósítás - Architektúra](#4-megvalósítás---architektúra)
- [5. Adat- és Adatbázisterv](#5-adat--és-adatbázisterv)
- [6. Adatbázis Entitások (Objektummodell)](#6-adatbázis-entitások-objektummodell)
- [7. Funkcionális Követelmények](#7-funkcionális-követelmények)
- [8. Komponensek](#8-komponensek)
- [9. Service Layer](#9-service-layer)
- [10. GUI-terv](#10-gui-terv)
- [11. Routing & Navigáció](#11-routing--navigáció)
- [12. Biztonsági Követelmények](#12-biztonsági-követelmények)
- [13. Telepítési Leírás](#13-telepítési-leírás)
- [14. A Program Készítése Során Felhasznált Eszközök](#14-a-program-készítése-során-felhasznált-eszközök)
- [15. Tervezési Minták](#15-tervezési-minták)
- [16. Összefoglalás](#16-összefoglalás)

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

## 2. A Rendszer Célja, Funkciói és Környezete

### 2.1 Feladatkiírás

A ChessApp egy modern, webalapú sakkalkalmazás, amely lehetővé teszi játékosok számára, hogy valós időben játszhassanak egymás ellen vagy AI ellen. A rendszer célja egy teljes körű sakk platform biztosítása, amely tartalmazza:

- **Valós idejű többjátékos sakk**: Játékosok egymás ellen játszhatnak azonos időben
- **AI ellenfél integráció**: Lichess API használatával 8 nehézségi szint
- **Rangsor rendszer**: ELO alapú versenyszerű értékelés
- **Játéktörténet**: Minden játék mentése és visszajátszhatósága
- **Felhasználó kezelés**: Regisztráció, bejelentkezés, profil kezelés
- **Közösségi funkciók**: Lobby, leaderboard, chat (tervezett)

**Fő követelmények**:
- Gyors, responsive webes felület
- Real-time szinkronizáció játékosok között
- Biztonságos authentikáció és adatkezelés
- Skálázható backend infrastruktúra
- Cross-platform kompatibilitás (asztali, mobil böngészők)

---

### 2.2 A Rendszer által Biztosítandó Tipikus Funkciók

#### Játék Funkciók
- ✅ Új játék létrehozása (időkorlát, increment, AI/human)
- ✅ Aktív játékokhoz csatlakozás (lobby)
- ✅ Valós idejű lépés szinkronizáció
- ✅ Sakkóra kezelés (Fischer óra)
- ✅ Lépéstörténet megjelenítés és navigáció
- ✅ Automatikus játék vége detekció (matt, patt, időtúllépés, stb.)
- ✅ Döntetlen ajánlás és elfogadás
- ✅ Feladás és megszakítás
- ✅ AI elleni játék (Lichess integráció)
- 🔮 Hint rendszer (Cloud Evaluation - tervezett UI)

#### Felhasználó Kezelés
- ✅ Regisztráció email/jelszóval
- ✅ Bejelentkezés Google OAuth-tal
- ✅ Vendég (guest) hozzáférés
- ✅ Profil szerkesztés (név, avatar, jelszó)
- ✅ ELO rangsor nyomon követés
- ✅ Statisztikák (győzelem, vereség, döntetlen)

#### Közösségi Funkciók
- ✅ Lobby (aktív játékok böngészése)
- ✅ Játéktörténet (saját befejezett játékok)
- ✅ Leaderboard (top 100 játékos)
- ✅ Játékos profil megtekintés
- 🔮 Chat rendszer (tervezett backend)
- 🔮 Barát rendszer (tervezett)

#### Adminisztratív Funkciók
- ✅ Automatikus ELO frissítés játék végén
- ✅ Automatikus statisztika számítás
- ✅ Realtime adatszinkronizáció
- 🔮 Játék moderáció (tervezett)
- 🔮 User banning (tervezett)

---

### 2.3 A Program Környezete

#### Kliens Oldal
**Platform**: Webes alkalmazás (modern böngészők)

**Támogatott Böngészők**:
- Chrome 90+ (ajánlott)
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

**Hardver Követelmények**:
- **Minimum**: 2 GB RAM, dual-core CPU
- **Ajánlott**: 4 GB RAM, quad-core CPU
- **Mobil**: iOS 14+, Android 8.0+

**Képernyőfelbontás**:
- Minimum: 1280x720 (HD)
- Ajánlott: 1920x1080 (Full HD)
- Támogatott: 320px - 4K (responsive design)

---

#### Szerver Oldal

**Backend as a Service (BaaS)**: Firebase

**Infrastruktúra Komponensek**:
- **Firebase Realtime Database**: Játék állapot tárolás (NoSQL)
- **Cloud Firestore**: Felhasználói profilok, statisztikák (dokumentum DB)
- **Firebase Authentication**: Email, Google OAuth, Anonymous
- **Firebase Storage**: Avatar képek tárolás (blob storage)
- **Firebase Hosting**: Static site hosting (CDN)
- **Firebase Functions**: Serverless backend logika (Node.js)

**Külső API-k**:
- **Lichess.org API**: AI játék, cloud evaluation
- **URL**: `https://lichess.org/api/`
- **Rate Limit**: 100 req/min (Board API), ∞ (Cloud Eval)

---

#### Hálózati Követelmények

**Internet Kapcsolat**:
- Minimum: 1 Mbps (letöltés/feltöltés)
- Ajánlott: 5+ Mbps (stabil real-time sync-hez)
- Latency: < 200ms (optimális játékélmény)

**Protokollok**:
- HTTPS (REST API)
- WebSocket (Firebase Realtime Database)
- EventSource (Lichess streaming)

---

#### Fejlesztői Környezet

**Operációs Rendszer**: Windows, macOS, Linux

**Node.js**: v18+ (LTS)

**Package Manager**: npm vagy yarn

**IDE**: Visual Studio Code (ajánlott), WebStorm, vagy bármely modern editor

**Git**: Verziókezelés (GitHub: sandortorok/ChessApp)

**Firebase CLI**: `npm install -g firebase-tools`

---

#### Produkció Környezet

**Hosting**: Firebase Hosting
- URL: `https://bme-chessapp.web.app`
- CDN: Global edge network
- SSL: Automatikus HTTPS

**Deployment**: Manuális (`firebase deploy`)

**Monitoring**: Firebase Console (realtime metrics)

**Backup**: Automatikus (Firebase managed)

**Scaling**: Automatikus (Firebase serverless architecture)

---

## 3. Technológiai Stack

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

## 4. Megvalósítás - Architektúra

### 3.1 Rétegzett Architektúra (Layered Architecture)

A ChessApp **4-rétegű architektúrát** használ, amely elválasztja a különböző felelősségi köröket:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Pages     │  │  Components  │  │    Hooks     │          │
│  │              │  │              │  │              │          │
│  │ - Home       │  │ - Header     │  │ - useAuth    │          │
│  │ - Lobby      │  │ - PlayerInfo │  │ - (custom)   │          │
│  │ - Game       │  │ - ChessClock │  │              │          │
│  │ - MyGames    │  │ - Modals     │  │              │          │
│  │ - Leaderboard│  │ - Forms      │  │              │          │
│  │ - Settings   │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  Felelősség: UI renderelés, user interakciók, routing           │
└─────────────────────────┬────────────────────────────────────────┘
                          │ Props, Callbacks, State
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       Services                            │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │   │
│  │  │ gameService │  │playerService │  │ aiGameService   │ │   │
│  │  │             │  │              │  │                 │ │   │
│  │  │ - create    │  │ - join       │  │ - startAIGame   │ │   │
│  │  │ - update    │  │ - getData    │  │ - streamState   │ │   │
│  │  │ - endGame   │  │ - getTime    │  │ - makeMove      │ │   │
│  │  │ - calcELO   │  │ - getSide    │  │ - getHint       │ │   │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐                      │   │
│  │  │userService  │  │lichessService│                      │   │
│  │  │             │  │              │                      │   │
│  │  │ - profile   │  │ - challenge  │                      │   │
│  │  │ - updateElo │  │ - makeMove   │                      │   │
│  │  │ - stats     │  │ - stream     │                      │   │
│  │  └─────────────┘  └──────────────┘                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Felelősség: Játék logika, ELO számítás, validálás, időkezelés  │
└─────────────────────────┬────────────────────────────────────────┘
                          │ Firebase API calls, External APIs
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Firebase SDK & External APIs                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────┐  │   │
│  │  │ Realtime   │  │ Firestore  │  │    Storage        │  │   │
│  │  │ Database   │  │            │  │                   │  │   │
│  │  │            │  │ - set()    │  │ - uploadBytes()   │  │   │
│  │  │ - ref()    │  │ - get()    │  │ - getDownloadURL()│  │   │
│  │  │ - onValue()│  │ - update() │  │                   │  │   │
│  │  │ - set()    │  │ - query()  │  │                   │  │   │
│  │  │ - update() │  │            │  │                   │  │   │
│  │  └────────────┘  └────────────┘  └───────────────────┘  │   │
│  │                                                           │   │
│  │  ┌────────────┐  ┌────────────┐                         │   │
│  │  │  Auth      │  │ Lichess    │                         │   │
│  │  │            │  │  API       │                         │   │
│  │  │ - signIn() │  │            │                         │   │
│  │  │ - signOut()│  │ - fetch()  │                         │   │
│  │  │ - onAuth() │  │ - stream() │                         │   │
│  │  └────────────┘  └────────────┘                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Felelősség: Adatbázis műveletek, API hívások, real-time sync   │
└─────────────────────────┬────────────────────────────────────────┘
                          │ Network requests
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SYSTEMS LAYER                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────┐  ┌─────────────────┐               │   │
│  │  │  Firebase Cloud │  │  Lichess.org    │               │   │
│  │  │                 │  │                 │               │   │
│  │  │  - Realtime DB  │  │  - Board API    │               │   │
│  │  │  - Firestore    │  │  - Cloud Eval   │               │   │
│  │  │  - Auth         │  │  - AI Engine    │               │   │
│  │  │  - Storage      │  │                 │               │   │
│  │  │  - Functions    │  │                 │               │   │
│  │  └─────────────────┘  └─────────────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Felelősség: Adattárolás, authentikáció, AI motor, cloud eval   │
└──────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Rétegek Részletes Leírása

#### 3.2.1 Presentation Layer (Prezentációs Réteg)
**Felelősség**: Felhasználói felület, user interakciók, routing

**Komponensek**:
- **Pages** (7 db): Home, Lobby, Game, MyGames, Leaderboard, Settings, Auth
- **Components** (18+ db): UI építőelemek, modals, forms
- **Hooks** (1 db): useAuth (custom hook)

**Technológiák**:
- React 19.1.1
- React Router DOM 7.9.3
- Tailwind CSS 4.1.14
- Headless UI, Heroicons

**Kommunikáció**:
- ⬇️ **Business Logic Layer**: Service metódus hívások
- ⬆️ **Browser**: DOM events, user input

**Példa kód**:
```typescript
// ChessGame.tsx (Container Component)
const handleMove = async (move: Move) => {
  await gameService.updateGameInDb(gameId, gameData, chessGame, fen, move);
};
```

**Design Patterns**:
- Presentational & Container Components
- Custom Hooks
- Composition Pattern

---

#### 3.2.2 Business Logic Layer (Üzleti Logika Réteg)
**Felelősség**: Játék logika, számítások, validálás, üzleti szabályok

**Komponensek**:
- **gameService**: Játék műveletek, ELO számítás, játék vége detekció
- **playerService**: Játékos kezelés, csatlakozás, időszámítás
- **aiGameService**: AI játék orchestration (Lichess integráció)
- **userService**: Felhasználói profil műveletek
- **lichessService**: Lichess API wrapper

**Technológiák**:
- TypeScript 5.8.3
- Chess.js 1.4.0 (sakk logika)
- Firebase SDK (csak API hívások)

**Kommunikáció**:
- ⬆️ **Presentation Layer**: Return values, callbacks
- ⬇️ **Data Access Layer**: Firebase SDK hívások, Lichess API

**Példa kód**:
```typescript
// gameService.ts
class GameService {
  async updateGameInDb(gameId: string, gameData: Game, ...): Promise<void> {
    // Validálás
    if (!this.isValidMove(move)) throw new Error("Invalid move");
    
    // Időszámítás
    const newTimeLeft = this.calculateTimeLeft(gameData, move);
    
    // Játék vége detekció
    const winner = this.detectWinner(chessGame);
    
    // Adatbázis frissítés (Data Access Layer)
    await update(ref(db, `games/${gameId}`), { fen, moves, timeLeft });
    
    // ELO frissítés ha vége
    if (winner) {
      await this.updateFirestoreOnGameEnd(gameId, gameData, winner);
    }
  }
}
```

**Design Patterns**:
- Singleton Pattern (service instances)
- Service Layer Pattern
- Strategy Pattern (game end logika)

---

#### 3.2.3 Data Access Layer (Adatelérési Réteg)
**Felelősség**: Adatbázis műveletek, API hívások, real-time synchronization

**Komponensek**:
- **Firebase Realtime Database**: Játék állapot (real-time sync)
- **Firestore**: Felhasználói profilok, statisztikák
- **Firebase Storage**: Avatar képek
- **Firebase Auth**: Authentikáció
- **Lichess API**: HTTP fetch, EventSource streaming

**Technológiák**:
- Firebase SDK 12.3.0
- Native Fetch API
- EventSource API (Lichess streaming)

**Kommunikáció**:
- ⬆️ **Business Logic Layer**: Adatok visszaadása (Promise, callback)
- ⬇️ **External Systems Layer**: Network requests (HTTPS)

**Példa kód**:
```typescript
// Firebase Realtime Database
import { ref, onValue, set, update } from "firebase/database";

// Olvasás (real-time listener)
const gameRef = ref(db, `games/${gameId}`);
onValue(gameRef, (snapshot) => {
  const data = snapshot.val();
  // Presentation Layer-nek továbbítás
});

// Írás
await set(ref(db, `games/${gameId}`), gameData);
await update(ref(db, `games/${gameId}`), { status: "ended" });

// Firestore
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Olvasás
const userDoc = await getDoc(doc(firestore, "users", userId));
const userData = userDoc.data();

// Írás
await setDoc(doc(firestore, "users", userId), userProfile);
await updateDoc(doc(firestore, "users", userId), { elo: newElo });

// Lichess API
const response = await fetch("https://lichess.org/api/board/game/stream/{gameId}", {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Design Patterns**:
- Observer Pattern (Firebase listeners)
- Repository Pattern (🔮 ajánlott, de nincs implementálva)

---

#### 3.2.4 External Systems Layer (Külső Rendszerek Réteg)
**Felelősség**: Adattárolás, authentikáció, AI motor, felhő szolgáltatások

**Komponensek**:
- **Firebase Cloud**: 
  - Realtime Database (NoSQL, real-time)
  - Firestore (dokumentum DB)
  - Authentication (email, Google, anonymous)
  - Storage (blob storage)
  - Functions (serverless backend)
  - Hosting (static files)
  
- **Lichess.org**:
  - Board API (AI játék)
  - Cloud Evaluation API (best move hint)
  - Stockfish AI Engine (1-8 difficulty)

**Kommunikáció**:
- ⬆️ **Data Access Layer**: JSON responses, WebSocket/EventSource streams
- 🌐 **Internet**: HTTPS, WSS

**Biztonsági szabályok**:
```javascript
// Firestore Rules
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}

// Realtime Database Rules
{
  "games": {
    "$gameId": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

### 3.3 Adatfolyam a Rétegeken Keresztül

#### 3.3.1 Játékos Lépés (Move) Flow

```
USER ACTION (Presentation Layer)
    │
    │ 1. Drag & Drop vagy Click-Click
    ▼
ChessGameView.tsx (Presentation)
    │
    │ 2. onPieceDrop callback
    ▼
ChessGame.tsx (Presentation - Container)
    │
    │ 3. Chess.js validálás (local)
    │ 4. gameService.updateGameInDb() hívás
    ▼
gameService.ts (Business Logic)
    │
    │ 5. Időszámítás
    │ 6. Increment hozzáadás
    │ 7. Játék vége ellenőrzés
    │ 8. ELO számítás (ha vége)
    ▼
Firebase Realtime DB (Data Access)
    │
    │ 9. update(ref(db, 'games/{gameId}'), {...})
    ▼
Firebase Cloud (External System)
    │
    │ 10. Adatbázis írás
    │ 11. WebSocket broadcast (real-time sync)
    ▼
Firebase Realtime DB (Data Access)
    │
    │ 12. onValue listener trigger
    ▼
ChessGame.tsx (Presentation)
    │
    │ 13. useState frissítés
    ▼
ChessGameView.tsx (Presentation)
    │
    │ 14. Re-render (új pozíció megjelenítés)
    ▼
USER SEES UPDATE (Browser)
```

#### 3.3.2 Felhasználó Bejelentkezés Flow

```
USER ACTION (Presentation Layer)
    │
    │ 1. Email + jelszó beírás
    ▼
LoginForm.tsx (Presentation)
    │
    │ 2. handleLogin() függvény
    │ 3. Firebase Auth signInWithEmailAndPassword()
    ▼
Firebase Auth SDK (Data Access)
    │
    │ 4. POST https://identitytoolkit.googleapis.com/...
    ▼
Firebase Auth (External System)
    │
    │ 5. Credentials ellenőrzés
    │ 6. JWT token generálás
    │ 7. onAuthStateChanged trigger
    ▼
Firebase Auth SDK (Data Access)
    │
    │ 8. onAuthStateChanged callback
    ▼
useAuth.ts (Presentation - Hook)
    │
    │ 9. setCurrentUser(user)
    │ 10. Firestore user profile betöltés
    ▼
userService.ts (Business Logic)
    │
    │ 11. getUserProfile(user)
    ▼
Firestore SDK (Data Access)
    │
    │ 12. getDoc(doc(firestore, 'users', userId))
    ▼
Firestore (External System)
    │
    │ 13. Dokumentum lekérdezés
    │ 14. User data visszaadás (elo, wins, losses, draws)
    ▼
useAuth.ts (Presentation)
    │
    │ 15. Context/State frissítés
    ▼
Header.tsx (Presentation)
    │
    │ 16. Avatar + név megjelenítés
    ▼
USER SEES PROFILE (Browser)
```

#### 3.3.3 AI Játék Lépés Flow

```
USER MAKES MOVE (Presentation Layer)
    │
    │ 1. Lépés a táblán
    ▼
ChessGame.tsx (Presentation)
    │
    │ 2. gameService.updateGameInDb()
    ▼
gameService.ts (Business Logic)
    │
    │ 3. Firebase Realtime DB frissítés
    │ 4. AI játék ellenőrzés (opponentType === "ai")
    ▼
aiGameService.ts (Business Logic)
    │
    │ 5. makeAIMove(lichessGameId, move)
    ▼
lichessService.ts (Business Logic)
    │
    │ 6. fetch POST /api/board/game/{gameId}/move/{move}
    ▼
Lichess API (External System)
    │
    │ 7. Stockfish AI move számítás
    │ 8. EventSource stream response
    ▼
aiGameService.ts (Business Logic)
    │
    │ 9. streamAIGameState() listener
    │ 10. AI move parse
    ▼
gameService.ts (Business Logic)
    │
    │ 11. Firebase Realtime DB frissítés (AI lépés)
    ▼
Firebase Realtime DB (Data Access)
    │
    │ 12. onValue listener trigger
    ▼
ChessGame.tsx (Presentation)
    │
    │ 13. AI lépés megjelenítés
    ▼
USER SEES AI MOVE (Browser)
```

---

### 3.4 Keresztréteg Függőségek (Cross-Cutting Concerns)

#### 3.4.1 Authentication
- **Presentation Layer**: LoginForm, RegisterForm, useAuth hook
- **Data Access Layer**: Firebase Auth SDK
- **External System**: Firebase Authentication

**Minden rétegen átszalad**: Minden API hívás ellenőrzi az auth state-et

---

#### 3.4.2 Error Handling
- **Presentation Layer**: Try-catch blokkok, error state
- **Business Logic Layer**: Custom Error objektumok
- **Data Access Layer**: Firebase error codes

⚠️ **Jelenleg hiányos**: Nincs globális error boundary

---

#### 3.4.3 Logging
- ❌ **Jelenleg nincs implementálva**
- 🔮 **Javaslat**: Decorator Pattern minden rétegen

---

#### 3.4.4 Performance Monitoring
- ❌ **Jelenleg nincs implementálva**
- 🔮 **Javaslat**: Firebase Performance Monitoring SDK

---

### 3.5 Magas Szintű Architektúra (Eredeti Diagram)

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

## 5. Adat- és Adatbázisterv

### 5.1 Adatbázis Technológia

A ChessApp **két Firebase adatbázis technológiát** használ párhuzamosan:

1. **Firebase Realtime Database** (NoSQL, JSON-alapú)
   - **Cél**: Játék állapot tárolás, real-time szinkronizáció
   - **Előny**: WebSocket alapú, < 100ms latency, automatikus offline sync
   - **Hátrány**: Korlátozott query képesség, nincs native indexelés

2. **Cloud Firestore** (NoSQL, dokumentum-alapú)
   - **Cél**: Felhasználói profilok, statisztikák, perzisztens adatok
   - **Előny**: Komplex query-k, indexelés, auto-scaling
   - **Hátrány**: Magasabb latency (~200-500ms), drágább

---

### 5.2 Adatbázis Szerkezet Áttekintés

```
Firebase Realtime Database:
└── /games/{gameId}          [Játék állapot - real-time]

Cloud Firestore:
├── /users/{userId}          [Felhasználói profilok]
└── /chats/{gameId}          [Chat üzenetek - tervezett]
    └── /messages/{msgId}

Firebase Storage:
└── /avatars/{userId}        [Avatar képek]
```

---

### 5.3 Entitás-Relációs Diagram

```
┌─────────────────────┐       1      N ┌─────────────────────┐
│       User          │◄───────────────►│        Game         │
│  (Firestore)        │                 │  (Realtime DB)      │
├─────────────────────┤                 ├─────────────────────┤
│ • uid (PK)          │                 │ • gameId (PK)       │
│ • email             │                 │ • fen               │
│ • displayName       │                 │ • moves[]           │
│ • photoURL          │                 │ • players           │
│ • elo               │                 │   - white (FK→User) │
│ • wins              │                 │   - black (FK→User) │
│ • losses            │                 │ • status            │
│ • draws             │                 │ • winner            │
│ • createdAt         │                 │ • timeLeft          │
│ • lastLogin         │                 │ • startingElo       │
│ • settings          │                 │ • finalElo          │
└─────────────────────┘                 │ • lichessGameId     │
                                        └─────────────────────┘

┌─────────────────────┐       N      1 ┌─────────────────────┐
│   Chat Message      │◄───────────────►│        Game         │
│  (Firestore)        │                 │                     │
├─────────────────────┤                 └─────────────────────┘
│ • messageId (PK)    │
│ • gameId (FK)       │
│ • userId (FK→User)  │
│ • userName          │
│ • message           │
│ • timestamp         │
└─────────────────────┘

┌─────────────────────┐       N      1 ┌─────────────────────┐
│    Avatar Image     │◄───────────────►│        User         │
│  (Storage)          │                 │                     │
├─────────────────────┤                 └─────────────────────┘
│ • path (PK)         │
│ • userId (FK)       │
│ • contentType       │
│ • size              │
│ • uploadedAt        │
└─────────────────────┘
```

**Kapcsolatok**:
- User ↔ Game: **N:M** (egy user több játékban, egy játékban max 2 user)
- Game → Chat: **1:N** (egy játékhoz több chat üzenet)
- User → Avatar: **1:1** (egy userhez egy avatar)

---

### 5.4 Firebase Realtime Database (Játékok)

**Gyökér struktúra**:
```
/games/
  ├── {gameId1}/
  ├── {gameId2}/
  └── {gameId3}/
```

**Indexelés**: Nincs natív index (client-side szűrés)

**Optimalizáció**:
- ✅ Shallow query: `.orderByChild('status')`
- ✅ Denormalizáció (player adatok duplikálva)
- ⚠️ Hiányosság: Nincs TTL (befejezett játékok végtelen ideig maradnak)

---

### 5.5 Cloud Firestore (Felhasználók)

**Collection struktúra**:
```
/users/
  ├── {userId1}/
  ├── {userId2}/
  └── {userId3}/
```

**Indexek**:
- ✅ Primary Index: `uid` (automatikus)
- ✅ Composite Index: `elo DESC` (leaderboard query)
- 🔮 Tervezett: `email` (email keresés)

**Query példák**:
```typescript
// Leaderboard (top 100)
query(collection(firestore, "users"), 
      orderBy("elo", "desc"), 
      limit(100))

// User lookup
doc(firestore, "users", userId)
```

---

### 5.6 Firebase Storage (Avatar-ok)

**Folder struktúra**:
```
/avatars/
  ├── {userId1}/profile.jpg
  ├── {userId2}/profile.png
  └── {userId3}/profile.webp
```

**Metadata**:
- Content-Type: image/jpeg, image/png, image/webp
- Max size: 5 MB
- Allowed: Authenticated users only

---

## 6. Adatbázis Entitások (Objektummodell)

### 6.1 Game Entitás (Realtime Database)

**Tábla**: `/games/{gameId}`

**Típus**: JSON dokumentum

**Attribútumok**:
| Mező | Típus | Leírás | Kötelező | Alapértelmezett |
|------|-------|--------|----------|-----------------|
| `gameId` | string | Egyedi azonosító (8 karakter) | ✅ | nanoid() |
| `fen` | string | Aktuális tábla pozíció (FEN) | ✅ | Starting position |
| `moves` | Move[] | Lépéstörténet array | ✅ | [] |
| `lastMove` | {from, to, san} | Utolsó lépés | ❌ | null |
| `players` | {white, black} | Játékosok objektum | ✅ | {white: null, black: null} |
| `turn` | "white" \| "black" | Aktuális lépő | ✅ | "white" |
| `status` | "waiting" \| "ongoing" \| "ended" | Játék állapot | ✅ | "waiting" |
| `winner` | "white" \| "black" \| "draw" \| null | Győztes | ❌ | null |
| `winReason` | winReason | Győzelem oka (9 típus) | ❌ | null |
| `timeLeft` | {white: number, black: number} | Hátralevő idő (ms) | ✅ | timeControl * 60000 |
| `timeControl` | number | Időkorlát (perc) | ✅ | 5 |
| `increment` | number | Increment (másodperc) | ✅ | 0 |
| `opponentType` | "human" \| "ai" | Ellenfél típus | ✅ | "human" |
| `createdAt` | number | Létrehozás timestamp | ✅ | Date.now() |
| `updatedAt` | number | Utolsó frissítés timestamp | ✅ | Date.now() |
| `started` | boolean | Elindult-e a játék | ✅ | false |
| `startingElo` | {white: number, black: number} | Kezdő ELO | ❌ | null |
| `finalElo` | {white: number, black: number} | Végső ELO | ❌ | null |
| `drawOfferedBy` | string \| null | Döntetlen ajánló user UID | ❌ | null |
| `lichessGameId` | string \| null | Lichess játék ID (AI játéknál) | ❌ | null |

**Relációk**:
- `players.white.uid` → User (Firestore)
- `players.black.uid` → User (Firestore)

---

### 6.2 User Entitás (Firestore)

**Collection**: `/users/{userId}`

**Típus**: Firestore dokumentum

**Attribútumok**:
| Mező | Típus | Leírás | Kötelező | Alapértelmezett |
|------|-------|--------|----------|-----------------|
| `uid` | string | Firebase Auth UID (PK) | ✅ | Auth generated |
| `email` | string | Email cím | ✅ | - |
| `displayName` | string | Megjelenített név | ✅ | Email prefix |
| `photoURL` | string | Avatar URL vagy emoji:👤 | ✅ | "emoji:👤" |
| `elo` | number | ELO rangsor | ✅ | 1200 |
| `wins` | number | Győzelmek száma | ✅ | 0 |
| `losses` | number | Vereségek száma | ✅ | 0 |
| `draws` | number | Döntetlenek száma | ✅ | 0 |
| `createdAt` | Timestamp | Regisztráció dátum | ✅ | serverTimestamp() |
| `lastLogin` | Timestamp | Utolsó bejelentkezés | ✅ | serverTimestamp() |
| `settings` | object | Felhasználói beállítások | ❌ | {} |

**settings Object**:
```typescript
{
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: string;
}
```

**Indexek**:
- Primary: `uid` (automatikus)
- Secondary: `elo` (descending)

---

### 6.3 Player Entitás (Denormalizált - Game-ben)

**Típus**: Nested object (Game.players.white / Game.players.black)

**Attribútumok**:
| Mező | Típus | Leírás | Kötelező |
|------|-------|--------|----------|
| `uid` | string | User azonosító | ✅ |
| `name` | string | Név (új játékoknál) | ❌ |
| `displayName` | string | Display name | ❌ |
| `email` | string | Email cím | ❌ |
| `elo` | number | Aktuális ELO | ✅ |
| `wins` | number | Győzelmek | ✅ |
| `losses` | number | Vereségek | ✅ |
| `draws` | number | Döntetlenek | ✅ |

**Megjegyzés**: Denormalizált adatok (duplikálva Firestore User-ből a gyorsabb lekérdezés érdekében)

---

### 6.4 Move Entitás (Game.moves array)

**Típus**: Array item (Game.moves[])

**Attribútumok**:
| Mező | Típus | Leírás | Példa |
|------|-------|--------|-------|
| `from` | Square | Kiindulási mező | "e2" |
| `to` | Square | Célmező | "e4" |
| `san` | string | Standard Algebraic Notation | "e4" |
| `fen` | string | Pozíció lépés után | "rnbqkbnr/..." |
| `updatedAt` | number | Lépés timestamp | 1634567890123 |
| `moveNumber` | number | Lépés sorszám | 1 |
| `timeLeft` | {white: number, black: number} | Idő lépés után | {white: 300000, black: 295000} |

---

### 6.5 ChatMessage Entitás (Firestore - Tervezett)

**Collection**: `/chats/{gameId}/messages/{messageId}`

**Típus**: Firestore sub-collection

**Attribútumok**:
| Mező | Típus | Leírás | Kötelező |
|------|-------|--------|----------|
| `messageId` | string | Egyedi azonosító (PK) | ✅ |
| `gameId` | string | Játék ID (FK) | ✅ |
| `userId` | string | Küldő user ID | ✅ |
| `userName` | string | Küldő név | ✅ |
| `message` | string | Üzenet szöveg | ✅ |
| `timestamp` | Timestamp | Küldés idő | ✅ |

**Státusz**: 🔮 Tervezett (backend nincs implementálva)

---

## 7. Adatbázis Struktúra (Részletes JSON)

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

## 7. Funkcionális Követelmények

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

## 8. Komponensek

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

## 9. Service Layer

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

## 10. GUI-terv

### 10.1 Felhasználói Felület Áttekintés

A ChessApp modern, sötét témájú (dark mode) felhasználói felülettel rendelkezik, amely a **Tailwind CSS** utility-first framework-öt használja.

**Design Filozófia**:
- 🎨 **Emerald/Zöld színpaletta**: Főszín `#10b981` (emerald-500)
- 🌑 **Dark mode**: Slate háttér (`#0f172a`, `#1e293b`)
- ⚡ **Glassmorphism**: Átlátszó kártyák, blur effektek
- 📱 **Responsive**: Mobile-first approach (320px - 4K)
- ♿ **Accessibility**: Headless UI komponensek, keyboard navigation

---

### 10.2 Színpaletta

| Szín | Hex | Használat |
|------|-----|-----------|
| **Emerald-400** | `#34d399` | Primary accent, hover states |
| **Emerald-500** | `#10b981` | Primary buttons, highlights |
| **Emerald-600** | `#059669` | Active states, borders |
| **Slate-900** | `#0f172a` | Főháttér |
| **Slate-800** | `#1e293b` | Kártyák háttere |
| **Slate-700** | `#334155` | Input mezők |
| **White** | `#ffffff` | Szöveg (primary) |
| **Emerald-300** | `#6ee7b7` | Szöveg (secondary) |
| **Red-500** | `#ef4444` | Error, danger |
| **Yellow-400** | `#facc15` | Warning |
| **Green-400** | `#4ade80` | Success, positive ELO |

---

### 10.3 Tipográfia

**Font Family**: System font stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Font Sizes** (Tailwind classes):
- `text-xs`: 12px (captions, labels)
---

## 12. Biztonsági Követelmények)
- `text-xl`: 20px (headings)
- `text-2xl`: 24px (page titles)
- `text-4xl`: 36px (hero text)

---

### 10.4 Layout Struktúra

```
┌─────────────────────────────────────────────────────────┐
│                    Header (Sticky)                       │
│  Logo │ Nav Links │                    │ User Avatar ▼  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    Main Content Area                     │
│                  (Page-specific layout)                  │
│                                                          │
│                                                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                Footer (opcionális)                       │
└─────────────────────────────────────────────────────────┘
```

**Header**: Sticky top navigation (minden oldalon)
**Main**: Dynamic content (1200px max-width, centered)
**Footer**: Jelenleg nincs implementálva

---

### 10.5 Oldal Layoutok

#### 10.5.1 Home Page (Landing)
```
┌─────────────────────────────────────────────────┐
│  [Hero Section]                                 │
│    "Welcome to ChessApp"                        │
│    [Quick Play Button]                          │
├─────────────────────────────────────────────────┤
│  [Features Grid - 3 columns]                    │
│    🤖 AI Opponents                              │
│    🏆 ELO Ranking                               │
│    🌐 Real-time Play                            │
├─────────────────────────────────────────────────┤
│  [CTA Section]                                  │
│    "Join the Chess Revolution"                  │
│    [Sign Up Button]                             │
└─────────────────────────────────────────────────┘
```

#### 10.5.2 Lobby Page
```
┌─────────────────────────────────────────────────┐
│  [Create Game Button]                           │
├─────────────────────────────────────────────────┤
│  [Active Games List]                            │
│    ┌─────────────────────────────────────────┐ │
│    │ Game #abc123  │ 5+0  │ 1200 vs 1250    │ │
│    │ Player1 vs Player2  │ [Join] [Spectate]│ │
│    └─────────────────────────────────────────┘ │
│    ┌─────────────────────────────────────────┐ │
│    │ Game #def456  │ 10+5 │ 1100 vs Waiting │ │
│    │ Player3 vs ...      │ [Join]           │ │
│    └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### 10.5.3 Game Page (Sakktábla)
```
┌──────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  [PlayerInfo]    │  │  [MoveHistory]           │ │
│  │  ● Black         │  │   1. e4 e5               │ │
│  │  ⏱ 05:00        │  │   2. Nf3 Nc6             │ │
│  ├──────────────────┤  │   3. Bb5 ...             │ │
│  │                  │  └──────────────────────────┘ │
│  │   [Chessboard]   │  ┌──────────────────────────┐ │
│  │                  │  │  [ChatBox]               │ │
│  │   8x8 squares    │  │  Player1: Good game!     │ │
│  │                  │  │  Player2: You too!       │ │
│  ├──────────────────┤  └──────────────────────────┘ │
│  │  [PlayerInfo]    │  [Surrender] [Draw] [Abort]  │
│  │  ● White         │                               │
│  │  ⏱ 04:55        │                               │
│  └──────────────────┘                               │
└──────────────────────────────────────────────────────┘
```

#### 10.5.4 Leaderboard Page
```
┌─────────────────────────────────────────────────┐
│  🏆 Top Players                                 │
├──────┬───────────────┬─────┬─────────┬─────────┤
│ Rank │ Player        │ ELO │ W/L     │ Win %   │
├──────┼───────────────┼─────┼─────────┼─────────┤
│  1   │ 👑 GrandMaster│ 2100│ 150/50  │ 75%     │
│  2   │ 🎯 ProPlayer  │ 1950│ 120/60  │ 67%     │
│  3   │ ⚔ Warrior     │ 1850│ 100/70  │ 59%     │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

---

### 10.6 Komponens Stílusok

#### 10.6.1 Button Stílusok
```css
/* Primary Button */
bg-emerald-600 hover:bg-emerald-700 text-white 
rounded-lg px-4 py-2 transition-colors

/* Secondary Button */
bg-slate-700 hover:bg-slate-600 text-emerald-400 
border border-emerald-600/30

/* Danger Button */
bg-red-600 hover:bg-red-700 text-white
```

#### 10.6.2 Card Stílusok
```css
bg-slate-800 border border-emerald-600/30 
rounded-xl shadow-lg shadow-emerald-500/10 p-6
```

#### 10.6.3 Input Stílusok
```css
bg-slate-700 border border-emerald-600/30 
text-white rounded-lg px-4 py-2 
focus:ring-2 focus:ring-emerald-500
```

#### 10.6.4 Modal Stílusok
```css
/* Backdrop */
bg-black/50 backdrop-blur-sm

/* Modal Content */
bg-slate-800 border border-emerald-600/50 
rounded-2xl shadow-2xl shadow-emerald-500/20 p-8
max-w-md
```

---

### 10.7 Responsive Breakpoints

| Breakpoint | Width | Leírás |
|------------|-------|--------|
| `sm` | 640px | Telefon (landscape) |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

**Mobile Optimalizáció**:
- Hamburger menü < 768px
- Sakktábla méret: 100% width (mobile), 600px (desktop)
- Stack layout (vertical) < 768px

---

### 10.8 Animációk és Átmenetek

**Tailwind Transition Classes**:
```css
transition-all duration-300 ease-in-out     /* Smooth transitions */
hover:scale-105                             /* Hover grow effect */
active:scale-95                             /* Click shrink effect */
animate-pulse                               /* Loading states */
animate-bounce                              /* Attention grabber */
```

**Custom Animációk**:
- Hero section: Fade-in + slide-up (Framer Motion)
- Modal: Scale + fade-in
- Toast notifications: Slide-in from top

---

### 10.9 Ikonok

**Forrás**: Heroicons, Lucide React

**Gyakori Ikonok**:
- ♟️ `ChevronRightIcon` - Navigáció
- 👤 `UserIcon` - Profil
- ⚙️ `Cog6ToothIcon` - Beállítások
- 🏆 `TrophyIcon` - Leaderboard
- 🎮 `PlayIcon` - Quick Play
- 🚪 `ArrowRightOnRectangleIcon` - Logout
- ⏱️ `ClockIcon` - Timer

---

### 10.10 Accessibility (A11y)

**Implementált Funkciók**:
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus states (ring-2 ring-emerald-500)
- ✅ ARIA labels (Headless UI komponensek)
- ✅ Color contrast: AAA rating (white on dark slate)
- ⚠️ Hiány: Screen reader optimalizáció (sakktábla)

---

## 11. Routing & Navigáció

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

## 13. Telepítési Leírás

### 13.1 Előfeltételek

**Szükséges Szoftverek**:
- Node.js 18+ (LTS verzió ajánlott)
- npm 9+ vagy yarn 1.22+
- Git (verziókezelés)
- Firebase CLI: `npm install -g firebase-tools`
- Modern böngésző (Chrome, Firefox, Safari, Edge)

**Firebase Projekt Beállítása**:
1. Firebase Console: `https://console.firebase.google.com`
2. "Add project" → Project név megadás
3. Google Analytics engedélyezése (opcionális)
4. Realtime Database létrehozása (Start in locked mode)
5. Firestore létrehozása (Start in production mode)
6. Authentication engedélyezése (Email/Password, Google)
7. Storage létrehozása (Default rules)

---

### 13.2 Lokális Fejlesztői Környezet Telepítése

#### Lépés 1: Repository Klónozása
```bash
git clone https://github.com/sandortorok/ChessApp.git
cd ChessApp/chess-frontend
```

#### Lépés 2: Függőségek Telepítése
```bash
npm install
# vagy
yarn install
```

#### Lépés 3: Environment Variables Beállítása
Hozz létre egy `.env` fájlt a `chess-frontend/` mappában:
```env
VITE_APP_TITLE=ChessApp
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_LICHESS_TOKEN=lip_YourLichessToken
```

**Firebase konfiguráció megszerzése**:
- Firebase Console → Project Settings → General → Your apps → Web app
- Copy-paste a config értékeket

**Lichess token megszerzése** (AI játékhoz):
- `https://lichess.org/account/oauth/token/create`
- Scopes: `board:play`, `challenge:write`

#### Lépés 4: Firebase Security Rules Beállítása

**Realtime Database Rules** (`database.rules.json`):
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

**Firestore Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only database
firebase deploy --only firestore:rules
```

#### Lépés 5: Fejlesztői Szerver Indítása
```bash
npm run dev
# vagy
yarn dev
```

Böngésző: `http://localhost:5173`

---

### 13.3 Production Build és Deployment

#### Lépés 1: Production Build Készítése
```bash
npm run build
# vagy
yarn build
```

Output: `chess-frontend/dist/` folder

**Build ellenőrzés**:
```bash
npm run preview
# vagy
yarn preview
```

#### Lépés 2: Firebase Hosting Inicializálás (első alkalommal)
```bash
firebase login
firebase init hosting
```

**Beállítások**:
- Public directory: `dist`
- Single-page app: Yes
- GitHub auto-deploys: No (manuális deployment)

#### Lépés 3: Firebase Deployment
```bash
firebase deploy --only hosting
```

**Deployment URL**: `https://your-project-id.web.app`

---

### 13.4 Firebase Functions Telepítése (Opcionális)

A projekt tartalmaz egy minimális Functions setup-ot:

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

**Megjegyzés**: Jelenleg a Functions üres (csak index.js placeholder)

---

### 13.5 Hibaelhárítás

**Probléma**: "Firebase config is not defined"
- **Megoldás**: Ellenőrizd a `.env` fájlt, minden VITE_ prefixszel rendelkezik-e

**Probléma**: "Permission denied" Firebase-ben
- **Megoldás**: Ellenőrizd a security rules-t, authentikációs state-et

**Probléma**: Build error: "Module not found"
- **Megoldás**: `rm -rf node_modules package-lock.json && npm install`

**Probléma**: Lichess API error 401
- **Megoldás**: Generálj új Lichess tokent, ellenőrizd a scope-okat

---

### 13.6 Continuous Integration (CI/CD)

**Jelenlegi Állapot**: ❌ GitHub Actions törölve (manuális deployment)

**Ajánlott CI/CD** (opcionális):
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
```

---

### 13.7 Monitoring és Maintenance

**Firebase Console**:
- Realtime Database: Usage metrics
- Authentication: Active users
- Hosting: Bandwidth, requests

**Ajánlott Monitoring** (nincs implementálva):
- Firebase Performance Monitoring
- Google Analytics
- Error tracking (Sentry)

---

## 14. A Program Készítése Során Felhasznált Eszközök

### 14.1 Fejlesztői Eszközök

**IDE / Editor**:
- Visual Studio Code 1.80+ (ajánlott)
  - Extensions: ESLint, Prettier, Tailwind IntelliSense, Firebase
- WebStorm (alternatíva)

**Verziókezelés**:
- Git 2.40+
- GitHub (repository hosting)
- GitHub Desktop (GUI, opcionális)

**Package Manager**:
- npm 9+ (Node.js-sel együtt)
- yarn 1.22+ (alternatíva)

**CLI Tools**:
- Firebase CLI 12+ (`npm install -g firebase-tools`)
- Vite CLI (projekt része)

---

### 14.2 Frontend Technológiák

**Core Framework**:
- React 19.1.1
- TypeScript 5.8.3
- Vite 7.1.7 (build tool)

**UI Framework**:
- Tailwind CSS 4.1.14
- Headless UI 2.2.9
- Heroicons 2.2.0
- Lucide React 0.469.0

**Chess Specifikus**:
- Chess.js 1.4.0 (sakk logika engine)
- react-chessboard 5.6.1 (sakktábla komponens)

**State Management**:
- React useState, useRef, useEffect (built-in)
- Firebase Realtime listeners (real-time sync)

**Routing**:
- React Router DOM 7.9.3

**Utilities**:
- nanoid 5.0.9 (unique ID generálás)
- date-fns 4.1.0 (dátum kezelés)

---

### 14.3 Backend Technológiák (Firebase)

**Firebase Services**:
- Firebase SDK 12.3.0
  - Authentication
  - Realtime Database
  - Cloud Firestore
  - Storage
  - Hosting
  - Functions (Node.js 18)

**Külső API**:
- Lichess.org Board API (AI játék)
- Lichess.org Cloud Evaluation API (hint)

---

### 14.4 Testing & Quality Assurance

**Linter**:
- ESLint 9.36.0
- ESLint React Hooks Plugin
- ESLint React Refresh Plugin

**Type Checking**:
- TypeScript Compiler (tsc)

**Code Formatting**:
- Prettier (ajánlott, nincs konfigurálva)

**Testing** (nincs implementálva):
- Vitest (ajánlott)
- React Testing Library
- Playwright / Cypress (E2E)

---

### 14.5 Design & Assets

**Design Tool**:
- Figma (UI/UX tervezés - nincs fájl)
- Sketch (alternatíva)

**Ikonok**:
- Heroicons (React komponensek)
- Lucide React (SVG ikonok)
- Emoji (avatar placeholder)

**Színpaletta Generator**:
- Tailwind CSS Color Palette
- Coolors.co

---

### 14.6 Collaboration & Project Management

**Verziókezelés**:
- GitHub (sandortorok/ChessApp)
- Git branching strategy: main branch (single branch)

**Dokumentáció**:
- Markdown (README.md, SPECIFICATION.md)
- JSDoc (inline kód dokumentáció - részben)

**Project Management** (nincs használva):
- GitHub Projects
- Trello
- Jira

---

### 14.7 Performance & Optimization

**Build Optimalizáció**:
- Vite (automatic code splitting, tree shaking)
- TypeScript (type checking pre-runtime)

**Bundle Analyzer** (nincs használva):
- rollup-plugin-visualizer

**Performance Monitoring** (nincs használva):
- Firebase Performance Monitoring SDK
- Lighthouse (Chrome DevTools)

---

### 14.8 Deployment & Hosting

**Hosting Platform**:
- Firebase Hosting (CDN, HTTPS, automatic)

**Deployment Tool**:
- Firebase CLI (`firebase deploy`)

**CI/CD** (nincs használva):
- GitHub Actions (törölve)

---

### 14.9 Third-Party Services

**Authentication Providers**:
- Firebase Authentication (Email, Google, Anonymous)

**AI Engine**:
- Lichess.org Stockfish AI (1-8 nehézség)

**Cloud Storage**:
- Firebase Storage (avatar képek)

---

### 14.10 Development Dependencies

**Teljes Lista** (`package.json` alapján):
```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "firebase": "^12.3.0",
    "chess.js": "^1.4.0",
    "react-chessboard": "^5.6.1",
    "react-router-dom": "^7.9.3",
    "tailwindcss": "^4.1.14",
    "@headlessui/react": "^2.2.9",
    "@heroicons/react": "^2.2.0",
    "lucide-react": "^0.469.0",
    "nanoid": "^5.0.9",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vite": "^7.1.7",
    "@vitejs/plugin-react": "^4.4.5",
    "eslint": "^9.36.0",
    "@types/react": "^19.1.7",
    "@types/react-dom": "^19.1.3"
  }
}
```

---

## 15. Deployment

### 15.1 Build Process
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
**Changelog**:
- **v3.0.0** (2025-10-17): Teljes specifikáció - összes fejezet hozzáadva
  - Rendszer célja és környezete
  - Feladatkiírás
  - Adat- és adatbázisterv (entitás-relációs modell)
  - Objektummodell (6 entitás részletezve)
  - GUI-terv (színek, tipográfia, layoutok)
  - Telepítési leírás (lokális + production)
  - Felhasznált eszközök
- **v2.0.0** (2025-10-17): Tervezési minták szakasz hozzáadva
- **v1.0.0** (2025-10-17): Kezdeti verzió (architektúra + komponensek)

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

