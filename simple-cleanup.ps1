# Egyszerű megoldás - .env.production eltávolítása (SIN History cleanup)
# Ez NEM törli a fájlt a git history-ból, csak a jövőbeni commit-okból!

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  .env.production eltávolítása (Egyszerű)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "ℹ️  Ez a módszer:" -ForegroundColor Cyan
Write-Host "   ✓ Eltávolítja a fájlt a git-ből" -ForegroundColor Green
Write-Host "   ✓ Megakadályozza a jövőbeni commit-olást" -ForegroundColor Green
Write-Host "   ✗ NEM törli a history-ból (régi commit-okban még látszik)" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  A fájl TOVÁBBRA IS ELÉRHETŐ a GitHub history-ban!" -ForegroundColor Red
Write-Host "   Ezért KÖTELEZŐ az API kulcsok rotálása!" -ForegroundColor Red
Write-Host ""

$continue = Read-Host "Folytatod? (igen/nem)"
if ($continue -ne "igen") {
    exit
}

Set-Location "C:\Users\Sanyi\Desktop\ChessApp"

Write-Host ""
Write-Host "1. Fájl eltávolítása a git-ből..." -ForegroundColor Cyan
git rm --cached chess-frontend/.env.production 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   (A fájl már el van távolítva)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. .gitignore frissítése..." -ForegroundColor Cyan
$gitignorePath = "chess-frontend\.gitignore"
$gitignoreContent = Get-Content $gitignorePath -Raw

if ($gitignoreContent -notmatch "\.env\.production") {
    Add-Content -Path $gitignorePath -Value "`n# Environment files`n.env.production`n.env.production.local"
    Write-Host "   ✓ .gitignore frissítve" -ForegroundColor Green
} else {
    Write-Host "   ✓ .gitignore már tartalmazza" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Commit..." -ForegroundColor Cyan
git add chess-frontend/.gitignore
git commit -m "fix: Remove .env.production and update .gitignore" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Commit kész" -ForegroundColor Green
} else {
    Write-Host "   (Nincs mit commitolni vagy már commit-olva van)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "4. Push GitHub-ra..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Push sikeres" -ForegroundColor Green
} else {
    Write-Host "   ✗ Push hiba!" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  KÉSZ!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  KÖVETKEZŐ LÉPÉSEK (KÖTELEZŐ!):" -ForegroundColor Red
Write-Host ""
Write-Host "1. Firebase API kulcsok rotálása:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/bme-chessapp/settings/general" -ForegroundColor White
Write-Host ""
Write-Host "2. Lichess token rotálása (ha van):" -ForegroundColor Yellow
Write-Host "   https://lichess.org/account/oauth/token" -ForegroundColor White
Write-Host ""
Write-Host "3. Firebase Security Rules ellenőrzése:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/bme-chessapp/firestore/rules" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  A fájl TOVÁBBRA IS LÁTHATÓ a git history-ban!" -ForegroundColor Red
Write-Host "   Ha teljesen törölni akarod, használd a cleanup-git-history.ps1 script-et" -ForegroundColor Yellow
Write-Host ""

Write-Host "Megnyitod a Firebase Console-t most? (igen/nem)" -ForegroundColor Cyan
$openConsole = Read-Host
if ($openConsole -eq "igen") {
    Start-Process "https://console.firebase.google.com/project/bme-chessapp/settings/general"
}
