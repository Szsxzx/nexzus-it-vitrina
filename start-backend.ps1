# ==========================================================
#  START-BACKEND.ps1  -  API FastAPI (puerto 4000)
#  - BD y archivos de estado en %APPDATA%\incodol\ (siempre escribible)
#  - Tolerante a Python 3.14 + permisos restrictivos en project folder
# ==========================================================
$ErrorActionPreference = "Continue"
$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"

# Carpeta donde guardamos BD y flags de estado
$dataDir = Join-Path $env:APPDATA "incodol"
if (-not (Test-Path -LiteralPath $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}
$dbPath   = Join-Path $dataDir "incodol.db"
$flagFile = Join-Path $dataDir ".deps_installed.md5"
$envFile  = Join-Path $dataDir ".env"

Write-Host ""
Write-Host "===  INCODOL - Backend (FastAPI)  ===" -ForegroundColor Cyan
Write-Host "[INFO] Datos persistentes en: $dataDir" -ForegroundColor DarkGray
Write-Host ""

# 1) Verificar Python
try {
    $pyVersionRaw = (python --version) 2>&1
    Write-Host "[OK]  Python detectado: $pyVersionRaw" -ForegroundColor Green
} catch {
    Write-Host "[ERROR]  No se encontro 'python' en el PATH." -ForegroundColor Red
    Read-Host "Pulsa ENTER para salir"
    exit 1
}

# 2) Saltar venv (causa mas problemas que soluciona en este escenario).
#    Usamos Python global con --user, ya funciono en el ultimo intento.
$PY = "python"
Write-Host "[OK]  Usando Python global (instalacion --user)" -ForegroundColor Green

# 3) Instalar dependencias si requirements cambio
$reqFile = Join-Path $backend "requirements.txt"
$reqHashNow   = (Get-FileHash -LiteralPath $reqFile -Algorithm MD5).Hash
$reqHashSaved = if (Test-Path -LiteralPath $flagFile) {
    Get-Content -LiteralPath $flagFile -ErrorAction SilentlyContinue
} else { "" }

if ($reqHashNow -ne $reqHashSaved) {
    Write-Host "[..]  Instalando dependencias (1-3 min la primera vez) ..." -ForegroundColor Yellow
    & $PY -m pip install --upgrade pip --quiet --disable-pip-version-check --user
    & $PY -m pip install --user -r $reqFile --disable-pip-version-check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR]  Fallo la instalacion de dependencias." -ForegroundColor Red
        Read-Host "Pulsa ENTER para salir"
        exit 1
    }
    try {
        Set-Content -LiteralPath $flagFile -Value $reqHashNow
    } catch {
        Write-Host "[WARN] No se pudo guardar el hash de deps. Se reinstalaran la proxima vez." -ForegroundColor DarkGray
    }
    Write-Host "[OK]  Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "[OK]  Dependencias al dia" -ForegroundColor Green
}

# 4) Generar .env DENTRO de %APPDATA%\incodol\ (escribible) con la BD apuntando ahi
$dbUrlForEnv = "sqlite:///" + ($dbPath -replace "\\", "/")
$envContent = @"
APP_NAME=INCODOL API
ENV=development
DEBUG=true
DATABASE_URL=$dbUrlForEnv
JWT_SECRET=change-me-to-a-long-random-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FIRST_ADMIN_EMAIL=admin@fuentedevida.co
FIRST_ADMIN_USERNAME=admin
FIRST_ADMIN_PASSWORD=Admin123!
"@
Set-Content -LiteralPath $envFile -Value $envContent -Encoding UTF8
Write-Host "[OK]  .env regenerado en $envFile" -ForegroundColor Green
Write-Host "      Base de datos: $dbPath" -ForegroundColor DarkGray

# Exportar variables de entorno PARA esta sesion (asi el .env de project folder se ignora)
$env:DATABASE_URL = $dbUrlForEnv
$env:JWT_SECRET = "change-me-to-a-long-random-string"
$env:JWT_ALGORITHM = "HS256"
$env:ACCESS_TOKEN_EXPIRE_MINUTES = "60"
$env:CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
$env:FIRST_ADMIN_EMAIL = "admin@fuentedevida.co"
$env:FIRST_ADMIN_USERNAME = "admin"
$env:FIRST_ADMIN_PASSWORD = "Admin123!"

# 5) Arrancar uvicorn
Write-Host ""
Write-Host "===  Arrancando servidor en http://localhost:4000  ===" -ForegroundColor Cyan
Write-Host "       Swagger:    http://localhost:4000/docs"          -ForegroundColor White
Write-Host "       Admin seed: admin / Admin123!"                    -ForegroundColor White
Write-Host "       Ctrl-C para detener"                              -ForegroundColor DarkGray
Write-Host ""

Set-Location -LiteralPath $backend
& $PY -m uvicorn app.main:app --reload --host 127.0.0.1 --port 4000
