# ♟️ ChessApp

> **Valós idejű online sakk platform React + TypeScript + Firebase technológiákkal**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-orange.svg)](https://firebase.google.com/)

## Főbb Funkciók

- **Valós idejű többjátékos meccsek** Firebase Realtime Database szinkronizációval
- **AI elleni játék** Lichess API integráció
- **ELO rangsor rendszer** kompetitív játékélményhez
- **Beépített chat** játék közbeni kommunikációhoz
- **Időmérés** Chess Clock implementációval
- **Játéktörténet** lépések visszajátszásával
- **Modern UI** Tailwind CSS-sel és animációkkal
- **Firebase Authentication** biztonságos felhasználókezeléssel

## Gyors Start

```bash
# Függőségek telepítése
cd chess-frontend
npm install

# Fejlesztői szerver indítása
npm run dev

# Production build
npm run build
```

## Projektstruktúra

```
chess-frontend/src/
├── features/              # Funkció alapú modulok
│   ├── game/             # Sakk játék logika
│   │   ├── components/   # UI komponensek (ChessGame, Chessboard, stb.)
│   │   ├── hooks/        # Custom hooks (useGameInitializer)
│   │   ├── services/     # Game service layer
│   │   ├── types/        # TypeScript típusok
│   │   ├── modals/       # Modal ablakok
│   │   └── utils/        # Segédfüggvények
│   ├── chat/             # Valós idejű chat
│   │   ├── components/   # ChatBox, Message komponensek
│   │   └── services/     # Chat service
│   ├── lobby/            # Játék létrehozás/keresés
│   │   ├── components/   # Lobby UI
│   │   └── types/        # Lobby típusok
│   ├── player/           # Játékos profil és ELO
│   │   ├── components/   # PlayerInfo, PlayerProfile
│   │   ├── services/     # Player service
│   │   └── types/        # Player típusok
│   └── auth/             # Autentikáció
│       └── hooks/        # useAuth hook
├── lib/                  # Külső könyvtárak konfigurációja
│   └── firebase/         # Firebase konfig
├── components/           # Közös komponensek
├── pages/                # Route alapú oldalak
└── assets/               # Statikus fájlok
```

## Architektúra Layers

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Chess Logic:** chess.js
- **UI Components:** react-chessboard
- **Backend:** Firebase (Realtime DB + Auth + Functions)
- **Routing:** React Router v7

## Játékmódok

1. **Ranked (Rangsorolt)** - ELO változással
2. **Casual (Barátságos)** - ELO nélkül *(fejlesztés alatt)*
3. **AI Practice** - Gyakorlás gépi ellenféllel *(fejlesztés alatt)*

## Firebase Konfiguráció

Hozz létre egy `.env` fájlt a `chess-frontend` mappában:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

## Dokumentáció

Teljes műszaki specifikáció elérhető: [SPECIFICATION.md](./SPECIFICATION.md)

## Fejlesztés

**Code Style:**
- ESLint + TypeScript strict mód
- Funkcionális komponensek React Hooks-sal
- Feature-based szervezés
- Service layer pattern

**Git Workflow:**
- `main` - Működőképes kód
- `refactoring` - Aktív fejlesztés

## Licenc

Ez egy oktatási célú projekt.

---

**Készítette:** Török Sándor | **Verzió:** 0.0.0 (fejlesztés alatt)
