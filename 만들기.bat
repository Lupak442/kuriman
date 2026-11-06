@echo off
cd /d "%~dp0"
echo [1/2] Kurimanju Shimeji (.exe) Build Starting...
echo.
call npm run build
echo.
if exist "dist\*.exe" (
    echo [2/2] Build Success! Opening dist folder...
    explorer "%~dp0dist"
) else (
    echo Build failed. Please check the logs above.
)
pause