# ==========================================================
#  START-FRONTEND.ps1  -  Next.js (puerto 3000)
# ==========================================================
$ErrorActionPreference = "Continue"
$root     = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "===  INCODOL - Frontend (Next.js)  ===" -ForegroundColor Cyan
Write-Host ""

# 1) Verificar Node y npm
try {
    $nodeVer = (node --version)
    $npmVer  = (npm --version)
    Write-Host "[OK]  Node detectado: $nodeVer" -ForegroundColor Green
    Write-Host "[OK]  npm  detectado: $npmVer"  -ForegroundColor Green
} catch {
    Write-Host "[ERROR]  No se encontro 'node' o 'npm' en el PATH." -ForegroundColor Red
    Write-Host "         Instala Node.js LTS desde https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pulsa ENTER para salir"
    exit 1
}

# 2) Garantizar .env.local (escribiendo el contenido directo, sin depender de Copy-Item)
$envFile = Join-Path $frontend ".env.local"
if (-not (Test-Path -LiteralPath $envFile)) {
    $envContent = @"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WPP_NUMBER=573164013230
"@
    Set-Content -LiteralPath $envFile -Value $envContent -Encoding UTF8
    Write-Host "[OK]  .env.local creado" -ForegroundColor Green
} else {
    Write-Host "[OK]  .env.local ya existe" -ForegroundColor Green
}

# 3) Instalar dependencias si node_modules no existe
$nodeModules = Join-Path $frontend "node_modules"
if (-not (Test-Path -LiteralPath $nodeModules)) {
    Write-Host "[..]  Instalando dependencias (2-5 min la primera vez) ..." -ForegroundColor Yellow
    Set-Location -LiteralPath $frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR]  Fallo npm install. Revisa los mensajes arriba." -ForegroundColor Red
        Read-Host "Pulsa ENTER para salir"
        exit 1
    }
    Write-Host "[OK]  Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "[OK]  node_modules ya existe (usando cache)" -ForegroundColor Green
}

# 4) Arrancar Next.js dev
Write-Host ""
Write-Host "===  Arrancando Next.js en http://localhost:3000  ===" -ForegroundColor Cyan
Write-Host "       Web publica: http://localhost:3000"             -ForegroundColor White
Write-Host "       Login admin: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "       (el backend debe estar en http://localhost:4000)" -ForegroundColor White
Write-Host "       Ctrl-C para detener"                             -ForegroundColor DarkGray
Write-Host ""

Set-Location -LiteralPath $frontend
npm run dev
