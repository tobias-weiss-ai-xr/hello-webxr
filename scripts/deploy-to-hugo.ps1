param(
  [string]$HugoStaticPath = "C:\Users\Tobias\git\hugo-chemie-lernen-org\myhugoapp\static\vr"
)

$ErrorActionPreference = "Stop"

Write-Host "[Deploy] Building PSE VR library..." -ForegroundColor Cyan
npm run build:lib

if ($LASTEXITCODE -ne 0) {
  Write-Error "[Deploy] Build failed!"
  exit 1
}

Write-Host "[Deploy] Copying to Hugo static directory..." -ForegroundColor Cyan
if (Test-Path $HugoStaticPath) {
  Remove-Item -Recurse -Force $HugoStaticPath
}
New-Item -ItemType Directory -Path "$HugoStaticPath\assets" -Force | Out-Null
Copy-Item "dist-embed\*" "$HugoStaticPath\assets\" -Recurse

Write-Host "[Deploy] Done! Files copied to: $HugoStaticPath" -ForegroundColor Green
