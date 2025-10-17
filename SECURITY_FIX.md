# 🚨 SÜRGŐS: API Kulcsok Rotálása

## A .env.production fájl felkerült a GitHub-ra a következő érzékeny adatokkal:

### Firebase konfiguráció (PUBLIKUS - AZONNAL CSERÉLNI!):
- API Key: AIzaSyD6krTFxe65PWyeZ_MuJrBVCpQDSUjhZd4
- Auth Domain: bme-chessapp.firebaseapp.com
- Project ID: bme-chessapp

## Teendők (SÜRGŐS - azonnal):

### 1. Firebase API kulcs rotálás
1. Menj a Firebase Console-ra: https://console.firebase.google.com/project/bme-chessapp/settings/general
2. Kattints a "Web API Key" mellett lévő regenerate gombra
3. Vagy korlátozd az API kulcsot a Google Cloud Console-ban:
   - https://console.cloud.google.com/apis/credentials?project=bme-chessapp
   - Állíts be HTTP referrer korlátozásokat (csak a saját domain-edről engedélyezd)

### 2. Firebase Security Rules ellenőrzése
Ellenőrizd, hogy a Firebase Security Rules megfelelően be vannak-e állítva:
- Firestore Rules: https://console.firebase.google.com/project/bme-chessapp/firestore/rules
- Realtime Database Rules: https://console.firebase.google.com/project/bme-chessapp/database/rules
- Storage Rules: https://console.firebase.google.com/project/bme-chessapp/storage/rules

**Győződj meg róla, hogy MINDEN védett és csak autentikált felhasználók férhetnek hozzá!**

### 3. A fájl eltávolítása a Git history-ból

Két lehetőség:

#### Opció A: BFG Repo-Cleaner (Ajánlott - gyorsabb)
```bash
# BFG telepítése (ha nincs meg)
# Windows: choco install bfg-repo-cleaner
# Mac: brew install bfg
# Vagy töltsd le: https://rtyley.github.io/bfg-repo-cleaner/

# Backup készítése
git clone --mirror https://github.com/sandortorok/ChessApp.git ChessApp-backup.git

# Fájl törlése a history-ból
bfg --delete-files .env.production ChessApp-backup.git

# Cleanup
cd ChessApp-backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (FIGYELEM: Ez felülírja a remote history-t!)
git push --force
```

#### Opció B: git filter-repo (Alternatíva)
```bash
# git filter-repo telepítése
pip install git-filter-repo

# Repository klónozása
cd ..
git clone https://github.com/sandortorok/ChessApp.git ChessApp-clean
cd ChessApp-clean

# Fájl eltávolítása a history-ból
git filter-repo --path chess-frontend/.env.production --invert-paths

# Force push
git push origin --force --all
```

#### Opció C: git filter-branch (Beépített, de lassabb)
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch chess-frontend/.env.production" \
  --prune-empty --tag-name-filter cat -- --all

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
git push origin --force --tags
```

### 4. .gitignore ellenőrzése és javítása

Győződj meg róla, hogy a `.gitignore` tartalmazza:
```
.env
.env.local
.env.production
.env.production.local
.env.development
.env.development.local
*.env
```

### 5. Minden munkatárs értesítése

Ha van csapatod, értesítsd őket:
```bash
# Mindenki frissítse a repository-t force pull-lal:
git fetch origin
git reset --hard origin/main
git clean -fd
```

## ⚠️ FONTOS MEGJEGYZÉSEK:

1. **Force push** után minden munkatársnak újra kell klónoznia a repo-t vagy hard reset-et kell csinálnia
2. Az **API kulcsok még mindig elérhetők lehetnek** a GitHub cache-ben és forkokban
3. **Firebase Security Rules** a legfontosabb védelem - ellenőrizd alaposan!
4. Használj **GitHub Secrets**-et CI/CD-hez, soha ne commitolj env fájlokat!

## Jövőbeli megelőzés:

1. Használj `.env.example` fájlokat csak placeholder értékekkel
2. Dokumentáld a szükséges környezeti változókat
3. GitHub Actions-nél használj Repository Secrets-et
4. Pre-commit hook-ok beállítása érzékeny fájlok észlelésére

---
Létrehozás dátuma: 2025-10-17
