# ==========================================================
#  FIX-FRONTEND.ps1  -  Reinstalacion limpia del frontend
#  Borra node_modules + cache + lock y reinstala desde cero.
# ==========================================================
$ErrorActionPreference = "Continue"
$root     = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "===  Reparacion de node_modules  ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $frontend)) {
    Write-Host "[ERROR]  No se encontro la carpeta frontend en $root" -ForegroundColor Red
    Read-Host "Pulsa ENTER para salir"
    exit 1
}

Set-Location -LiteralPath $frontend

# 1) Detener cualquier proceso npm/node corriendo
Write-Host "[..]  Deteniendo procesos node residuales ..." -ForegroundColor Yellow
Get-Process -Name "node", "npm" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 2) Borrar node_modules
if (Test-Path "node_modules") {
    Write-Host "[..]  Borrando node_modules (puede tardar 30-60s) ..." -ForegroundColor Yellow
    Remove-Item -LiteralPath "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path "node_modules") {
        Write-Host "[WARN] No se borro completo. Probando con cmd /c rmdir ..." -ForegroundColor Yellow
        cmd /c "rmdir /s /q node_modules" 2>$null
    }
    Write-Host "[OK]  node_modules eliminado" -ForegroundColor Green
}

# 3) Borrar package-lock.json
if (Test-Path "package-lock.json") {
    Remove-Item -LiteralPath "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "[OK]  package-lock.json eliminado" -ForegroundColor Green
}

# 4) Borrar .next (cache de build viejo)
if (Test-Path ".next") {
    Remove-Item -LiteralPath ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[OK]  .next eliminado" -ForegroundColor Green
}

# 5) Limpiar cache global de npm
Write-Host "[..]  Limpiando cache de npm ..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "[OK]  Cache limpiado" -ForegroundColor Green

# 6) Reinstalar desde cero
Write-Host ""
Write-Host "[..]  npm install (3-8 min, NO interrumpas) ..." -ForegroundColor Yellow
Write-Host ""
npm install --no-audit --no-fund --loglevel=error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR]  npm install fallo. Revisa los mensajes arriba." -ForegroundColor Red
    Write-Host ""
    Write-Host "Probables causas:" -ForegroundColor Yellow
    Write-Host "  1. Antivirus bloqueando escritura. Desactiva temporal Windows Defender." -ForegroundColor White
    Write-Host "  2. Disco E: con permisos restrictivos. Considera mover a C:\." -ForegroundColor White
    Write-Host "  3. Sin internet o muy lento." -ForegroundColor White
    Read-Host "Pulsa ENTER para salir"
    exit 1
}
Write-Host ""
Write-Host "[OK]  Instalacion completa" -ForegroundColor Green

# 7) Verificar paquete critico
Write-Host ""
$critical = "node_modules\postcss-selector-parser\dist\index.js"
if (Test-Path -LiteralPath $critical) {
    Write-Host "[OK]  Modulos criticos presentes" -ForegroundColor Green
} else {
    Write-Host "[WARN] Falta postcss-selector-parser, instalando explicito ..." -ForegroundColor Yellow
    npm install postcss-selector-parser --save-dev
}

# 8) Arrancar dev
Write-Host ""
Write-Host "===  Arrancando Next.js en http://localhost:3000  ===" -ForegroundColor Cyan
Write-Host "       Login admin: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "       admin / Admin123!" -ForegroundColor White
Write-Host "       Ctrl-C para detener" -ForegroundColor DarkGray
Write-Host ""
npm run dev
