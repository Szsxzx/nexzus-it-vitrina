@echo off
REM Atajo .bat — invoca el script PowerShell sin restricciones de política
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-all.ps1"
