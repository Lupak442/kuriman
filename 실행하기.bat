@echo off
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
if not exist "%~dp0node_modules\electron\dist\electron.exe" call npm install
start "" "%~dp0node_modules\electron\dist\electron.exe" .