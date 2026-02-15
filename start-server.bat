@echo off
cd /d %~dp0
set NODE_OPTIONS=--openssl-legacy-provider
npx webpack-dev-server -d --host 0.0.0.0 --port 8080
pause