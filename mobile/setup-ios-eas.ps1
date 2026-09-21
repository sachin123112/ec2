# PawMart Mobile - Expo EAS iOS setup for Windows
# Run this script from the mobile folder or from the project root.

$ErrorActionPreference = "Stop"

Write-Host "Setting up Expo EAS iOS build flow..." -ForegroundColor Cyan

# 1) Install project dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

# 2) Install EAS CLI globally
Write-Host "Installing EAS CLI..." -ForegroundColor Yellow
npm install -g eas-cli

# 3) Log in to Expo
Write-Host "Please sign in to Expo in the browser window that opens..." -ForegroundColor Yellow
& eas login

# 4) Configure the Expo project for EAS
Write-Host "Configuring EAS project..." -ForegroundColor Yellow
& eas build:configure

# 5) Build iOS preview in the cloud
Write-Host "Starting iOS preview build through EAS..." -ForegroundColor Yellow
& eas build --platform ios --profile preview

Write-Host "Setup complete. If you want a production build, run:" -ForegroundColor Green
Write-Host "eas build --platform ios --profile production" -ForegroundColor Green
