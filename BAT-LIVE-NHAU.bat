@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Lan dau chay: dang cai thu vien (legacy-peer-deps), doi 1-2 phut...
  call npm install --legacy-peer-deps
)
echo Dang bat QUAN NHAU BINH DAN 1 2 3 DO... Dong cua so nay la tat app.
echo ========================================================
echo LINK NGUON TIKTOK LIVE STUDIO (OBS):
echo http://lvh.me:3000/?view=stage^&theme=nhau
echo ========================================================
rem Live mode: the stage page never reloads by itself while streaming
set LIVE_MODE=1
start "" cmd /c "timeout /t 5 >nul & start http://localhost:3000/?theme=nhau"
npm run dev
pause
