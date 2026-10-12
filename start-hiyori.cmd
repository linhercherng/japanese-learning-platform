@echo off
cd /d "%~dp0"
echo Hiyori local app: http://127.0.0.1:18090/
echo Keep this window open while learning. Press Ctrl+C to stop.
node scripts/serve.mjs
pause
