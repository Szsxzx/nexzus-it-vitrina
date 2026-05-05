# ==========================================================
#  MOVE-TO-C.ps1  -  Mueve el proyecto a C:\Dev\incodol\
#  (sin acentos, fuera de OneDrive, fuera de E:)
# ==========================================================
$ErrorActionPreference = "Continue"
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$dst = "C:\Dev\incodol"

Write-Host ""
Write-Host "===  Migrando proyecto a $dst  ===" -ForegroundColor Cyan
Write-Host ""

# 1) Detener procesos node/python residuales
Write-Host "[..]  Deteniendo procesos node/python ..." -ForegroundColor Yellow
Get-Process -Name "node", "npm", "python", "uvicorn" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2) Crear destino
if (-not (Test-Path $dst)) {
    New-Item -ItemType Directory -Path $dst -Force | Out-Null
    Write-Host "[OK]  Carpeta creada: $dst" -ForegroundColor Green
} else {
    Write-Host "[OK]  Carpeta ya existe: $dst" -ForegroundColor Green
}

# 3) Copiar con robocopy (excluye lo que se reinstala/regenera)
Write-Host "[..]  Copiando archivos (excluye node_modules, .venv, .next, *.db) ..." -ForegroundColor Yellow
$exclude = @("node_modules", ".venv", ".next", "__pycache__", "legacy")
$xdArgs = @()
foreach ($x in $exclude) { $xdArgs += "/XD"; $xdArgs += $x }
$xfArgs = @("/XF", "*.db", "*.db-journal", "*.sqlite3", ".deps_installed.md5")

robocopy $src $dst /E /NFL /NDL /NJH /NJS /NP $xdArgs $xfArgs | Out-Null
$rc = $LASTEXITCODE
# robocopy: 0-7 son OK, 8+ son error
if ($rc -ge 8) {
    Write-Host "[ERROR]  robocopy fallo con codigo $rc" -ForegroundColor Red
    Read-Host "Pulsa ENTER para salir"
    exit 1
}
Write-Host "[OK]  Archivos copiados" -ForegroundColor Green

# 4) Mostrar instrucciones
Write-Host ""
Write-Host "===  MIGRACION COMPLETA  ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tu proyecto ahora vive en:" -ForegroundColor White
Write-Host "  $dst" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pasos siguientes (copia y pega en una PowerShell NUEVA):" -ForegroundColor White
Write-Host ""
Write-Host "  cd $dst" -ForegroundColor Yellow
Write-Host "  .\start-all.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "El backend y frontend se instalaran de cero en C: (sin OneDrive ni" -ForegroundColor DarkGray
Write-Host "interferencia de Defender). Tarda 3-8 min la primera vez." -ForegroundColor DarkGray
Write-Host ""
Write-Host "Cuando arranquen, abre: http://localhost:3000/admin/login" -ForegroundColor Green
Write-Host "                      admin / Admin123!" -ForegroundColor Green
Write-Host ""

# 5) Abrir explorer en la nueva carpeta para confirmar
explorer.exe $dst

Read-Host "Pulsa ENTER para cerrar esta ventana"
