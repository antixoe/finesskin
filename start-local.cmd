@echo off
cd /d "%~dp0"
start "Finesskin Backend" cmd /k "%~dp0start-backend.cmd"
start "Finesskin Frontend" cmd /k "%~dp0start-frontend.cmd"
