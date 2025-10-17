# Git History Cleanup Script
# Ez a script eltávolítja a .env.production fájlt a teljes git history-ból

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  Git History Cleanup - .env.production törlése" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  FIGYELEM: Ez a művelet MÓDOSÍTJA a git history-t!" -ForegroundColor Red
Write-Host "   - Minden commit SHA megváltozik" -ForegroundColor Red
Write-Host "   - Force push lesz szükséges" -ForegroundColor Red
Write-Host "   - Minden munkatársnak újra kell klónoznia a repo-t" -ForegroundColor Red
Write-Host ""

$continue = Read-Host "Folytatod? (igen/nem)"
if ($continue -ne "igen") {
    Write-Host "Művelet megszakítva." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "1. Backup készítése..." -ForegroundColor Cyan
$backupPath = "C:\Users\Sanyi\Desktop\ChessApp-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path "C:\Users\Sanyi\Desktop\ChessApp" -Destination $backupPath -Recurse -Force
Write-Host "   ✓ Backup mentve: $backupPath" -ForegroundColor Green

Write-Host ""
Write-Host "2. Git filter-branch futtatása..." -ForegroundColor Cyan
Write-Host "   (Ez eltarthat néhány percig...)" -ForegroundColor Gray

Set-Location "C:\Users\Sanyi\Desktop\ChessApp"

# Git filter-branch használata a fájl eltávolítására
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch chess-frontend/.env.production" `
  --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Filter-branch sikeres" -ForegroundColor Green
} else {
    Write-Host "   ✗ Hiba történt a filter-branch során!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Git cleanup..." -ForegroundColor Cyan
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "   ✓ Cleanup kész" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  SIKER! A fájl eltávolítva a git history-ból" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Következő lépések:" -ForegroundColor Yellow
Write-Host "1. Ellenőrizd a változásokat:" -ForegroundColor White
Write-Host "   git log --all --full-history -- chess-frontend/.env.production" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Force push a remote-ra:" -ForegroundColor White
Write-Host "   git push origin --force --all" -ForegroundColor Gray
Write-Host "   git push origin --force --tags" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ⚠️  AZONNAL rotáld a Firebase API kulcsokat!" -ForegroundColor Red
Write-Host "   https://console.firebase.google.com/project/bme-chessapp/settings/general" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Értesítsd a csapatot:" -ForegroundColor White
Write-Host "   Mindenki frissítse: git fetch origin && git reset --hard origin/main" -ForegroundColor Gray
Write-Host ""

$push = Read-Host "Force push-olsz most a GitHub-ra? (igen/nem)"
if ($push -eq "igen") {
    Write-Host ""
    Write-Host "Force push-olás..." -ForegroundColor Cyan
    git push origin --force --all
    git push origin --force --tags
    Write-Host "✓ Push kész!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  NE FELEJTS EL új Firebase API kulcsokat generálni!" -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "Később ne felejtsd el force push-olni!" -ForegroundColor Yellow
}
