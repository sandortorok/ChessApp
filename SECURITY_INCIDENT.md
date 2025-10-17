# 🚨 Biztonsági Incidens Összefoglaló

**Dátum:** 2025-10-17  
**Probléma:** A `chess-frontend/.env.production` fájl publikusan elérhető a GitHub repository-ban

---

## ✅ Eddig elvégzett lépések:

### 1. ✓ Fájl eltávolítása a jelenlegi verzióból
- `git rm --cached chess-frontend/.env.production`
- Commit és push: `48855dc`
- **Státusz:** ✅ KÉSZ

### 2. ✓ .gitignore javítása
- Bővített környezeti változó védelem hozzáadva
- **Státusz:** ✅ KÉSZ

### 3. ✓ PowerShell script-ek készítése
Három script áll rendelkezésre a git history tisztításához:

#### a) `simple-cleanup.ps1` (Már futott)
- Egyszerű megoldás, NEM törli a history-t
- ✅ Futtattam, push kész

#### b) `cleanup-git-history.ps1` (Ajánlott)
- Git filter-branch használat
- Teljesen eltávolítja a history-ból
- ⏳ **MÉG NEM FUTOTT**

#### c) `cleanup-with-bfg.ps1` (Leggyorsabb)
- BFG Repo-Cleaner használat
- Leggyorsabb megoldás
- ⏳ **MÉG NEM FUTOTT**

---

## ⚠️ SÜRGŐS TEENDŐK (Azonnal!)

### 1. 🔴 KRITIKUS: Firebase API kulcsok rotálása

**Érintett kulcsok:**
```
API Key: AIzaSyD6krTFxe65PWyeZ_MuJrBVCpQDSUjhZd4
Project ID: bme-chessapp
```

**Lépések:**
1. Menj a Firebase Console-ra:
   - https://console.firebase.google.com/project/bme-chessapp/settings/general

2. **Opció A:** API kulcs korlátozása (Gyorsabb)
   - Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=bme-chessapp
   - Kattints az API kulcsra
   - "Application restrictions" → "HTTP referrers"
   - Add hozzá: `https://your-domain.com/*` és `https://*.firebaseapp.com/*`
   - Mentés

3. **Opció B:** Új API kulcs generálása (Biztonságosabb)
   - Új Web API kulcs létrehozása
   - Régi kulcs deaktiválása
   - Frissítsd a `.env` és `.env.production` fájlokat

### 2. 🔴 Firebase Security Rules ellenőrzése

**Kritikus fontosságú!** A nyilvános API kulcs önmagában nem probléma, HA a Security Rules megfelelően be vannak állítva!

Ellenőrizd azonnal:

#### Firestore Rules:
https://console.firebase.google.com/project/bme-chessapp/firestore/rules

Minimum védelem:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Csak autentikált felhasználók
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Realtime Database Rules:
https://console.firebase.google.com/project/bme-chessapp/database/rules

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

#### Storage Rules:
https://console.firebase.google.com/project/bme-chessapp/storage/rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. 🟡 Lichess Token ellenőrzése

Ha a `.env.production` tartalmazott Lichess tokent is:
- https://lichess.org/account/oauth/token
- Töröld a régi tokent
- Generálj újat

### 4. 🟡 Git History tisztítása (Opcionális, de ajánlott)

**Ha teljesen el akarod távolítani a fájlt a history-ból:**

```powershell
# Gyors módszer BFG-vel:
.\cleanup-with-bfg.ps1

# Vagy beépített git-tel:
.\cleanup-git-history.ps1
```

**⚠️ Figyelem:** Ezek force push-t igényelnek és minden munkatársnak újra kell klónoznia a repo-t!

---

## 📋 Ellenőrző lista

- [ ] Firebase API kulcs korlátozva/rotálva
- [ ] Firebase Security Rules ellenőrizve és javítva
- [ ] Firestore Rules: ✓ védve
- [ ] Realtime Database Rules: ✓ védve
- [ ] Storage Rules: ✓ védve
- [ ] Lichess token rotálva (ha volt)
- [ ] `.env.production` eltávolítva a jelenlegi verzióból ✅
- [ ] `.gitignore` frissítve ✅
- [ ] Git history tisztítva (opcionális)
- [ ] Csapat értesítve (ha van)
- [ ] Firebase Usage Monitoring beállítva (quota figyelmeztetések)

---

## 🛡️ Jövőbeni megelőzés

### 1. Pre-commit hook telepítése

Hozz létre: `.git/hooks/pre-commit`

```bash
#!/bin/sh

# Ellenőrzés érzékeny fájlokra
if git diff --cached --name-only | grep -E '\\.env(\\.production|\\.local)?$'; then
    echo "❌ HIBA: .env fájl commitolása megakadályozva!"
    exit 1
fi
```

### 2. GitHub Actions - Secret Scanning

A GitHub automatikusan észleli az API kulcsokat. Ellenőrizd:
- https://github.com/sandortorok/ChessApp/settings/security_analysis

### 3. Dokumentáció

Mindig használj `.env.example` fájlokat placeholder értékekkel:
```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_LICHESS_TOKEN=your_token_here
```

### 4. CI/CD Best Practices

GitHub Actions esetén használj Repository Secrets-et:
- Settings → Secrets and variables → Actions
- Ne használj `.env.production` fájlt CI-ben!

---

## 📞 Segítség

Ha kérdésed van vagy segítségre van szükséged:
1. Ellenőrizd a `SECURITY_FIX.md` fájlt részletes utasításokért
2. Firebase dokumentáció: https://firebase.google.com/docs/rules
3. Git History cleanup: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

**Létrehozva:** 2025-10-17  
**Utolsó frissítés:** 2025-10-17 (simple-cleanup.ps1 futtatva, push kész)
