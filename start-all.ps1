# ==========================================================
#  START-ALL.ps1  -  Abre backend y frontend en 2 ventanas
# ==========================================================
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "===  Iniciando INCODOL completo  ===" -ForegroundColor Cyan
Write-Host "  Se abriran DOS ventanas de PowerShell (una por servidor)." -ForegroundColor White
Write-Host "  Cierra cada ventana o pulsa Ctrl-C para detenerlas."       -ForegroundColor White
Write-Host ""

$be = Join-Path $root "start-backend.ps1"
$fe = Join-Path $root "start-frontend.ps1"

if (-not (Test-Path $be)) {
    Write-Host "[ERROR] No se encontro start-backend.ps1" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $fe)) {
    Write-Host "[ERROR] No se encontro start-frontend.ps1" -ForegroundColor Red
    exit 1
}

Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $be
Start-Sleep -Seconds 2
Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $fe

Write-Host "[OK] Ambos servidores arrancando en ventanas separadas." -ForegroundColor Green
Write-Host "     Espera a que terminen de instalar y abre:"          -ForegroundColor White
Write-Host "       http://localhost:3000"                            -ForegroundColor Cyan
Write-Host "       http://localhost:3000/admin/login"                -ForegroundColor Cyan
Write-Host ""
Read-Host "Pulsa ENTER para cerrar esta ventana"
