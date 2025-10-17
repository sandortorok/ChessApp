# Git History Cleanup - BFG Repo-Cleaner használatával (Gyorsabb!)
# https://rtyley.github.io/bfg-repo-cleaner/

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  BFG Repo-Cleaner - .env.production törlése" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

# BFG ellenőrzése
$bfgPath = "C:\Users\Sanyi\Desktop\ChessApp\bfg.jar"
if (-not (Test-Path $bfgPath)) {
    Write-Host "BFG nem található!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Letöltés módjai:" -ForegroundColor Yellow
    Write-Host "1. Chocolatey: choco install bfg-repo-cleaner" -ForegroundColor Gray
    Write-Host "2. Manuális: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Gray
    Write-Host "   Töltsd le és helyezd ide: $bfgPath" -ForegroundColor Gray
    Write-Host ""
    
    $download = Read-Host "Letöltsem most? (igen/nem)"
    if ($download -eq "igen") {
        Write-Host "Letöltés..." -ForegroundColor Cyan
        $bfgUrl = "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar"
        Invoke-WebRequest -Uri $bfgUrl -OutFile $bfgPath
        Write-Host "✓ BFG letöltve!" -ForegroundColor Green
    } else {
        Write-Host "Script vége. Töltsd le a BFG-t és futtasd újra." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "⚠️  FIGYELEM: Ez a művelet MÓDOSÍTJA a git history-t!" -ForegroundColor Red
Write-Host ""

$continue = Read-Host "Folytatod? (igen/nem)"
if ($continue -ne "igen") {
    Write-Host "Művelet megszakítva." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "1. Mirror clone készítése..." -ForegroundColor Cyan
$mirrorPath = "C:\Users\Sanyi\Desktop\ChessApp-mirror"
if (Test-Path $mirrorPath) {
    Remove-Item -Path $mirrorPath -Recurse -Force
}

git clone --mirror "C:\Users\Sanyi\Desktop\ChessApp\.git" $mirrorPath

Write-Host "   ✓ Mirror clone kész" -ForegroundColor Green

Write-Host ""
Write-Host "2. BFG futtatása..." -ForegroundColor Cyan
java -jar $bfgPath --delete-files ".env.production" $mirrorPath

Write-Host ""
Write-Host "3. Git cleanup..." -ForegroundColor Cyan
Set-Location $mirrorPath
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "   ✓ Cleanup kész" -ForegroundColor Green

Write-Host ""
Write-Host "4. Változások visszamásolása..." -ForegroundColor Cyan
Set-Location "C:\Users\Sanyi\Desktop\ChessApp"
git remote add mirror $mirrorPath
git fetch mirror
git reset --hard mirror/main

Write-Host "   ✓ Változások alkalmazva" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  SIKER!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Következő lépések:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Force push a GitHub-ra:" -ForegroundColor White
Write-Host "   git push origin --force --all" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ⚠️  AZONNAL rotáld a Firebase API kulcsokat!" -ForegroundColor Red
Write-Host "   https://console.firebase.google.com/project/bme-chessapp/settings/general" -ForegroundColor Gray
Write-Host ""

# Cleanup mirror
Remove-Item -Path $mirrorPath -Recurse -Force

$push = Read-Host "Force push most? (igen/nem)"
if ($push -eq "igen") {
    git push origin --force --all
    git push origin --force --tags
    Write-Host "✓ Push kész!" -ForegroundColor Green
}
