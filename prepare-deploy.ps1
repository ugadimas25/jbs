# Prepare files untuk upload ke VPS
# Run script ini di Windows sebelum upload ke server

Write-Host "📦 Preparing JBS App for VPS Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if required files exist
$requiredFiles = @(
    "package.json",
    "server\index.ts",
    "drizzle.config.ts",
    ".env.example"
)

$missing = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "✅ All required files present" -ForegroundColor Green
Write-Host ""

# Create deployment package (exclude unnecessary files)
$excludeDirs = @("node_modules", "dist", ".git")
$deployFiles = "jbs_app_deploy"

Write-Host "📂 Creating deployment package..." -ForegroundColor Yellow

# Remove old deployment package if exists
if (Test-Path $deployFiles) {
    Remove-Item -Recurse -Force $deployFiles
}

# Create deployment directory
New-Item -ItemType Directory -Path $deployFiles | Out-Null

# Copy all files except excluded directories
Write-Host "   Copying files..." -ForegroundColor Gray

Get-ChildItem -Path . -Exclude $excludeDirs,"$deployFiles",".env","logs" | Copy-Item -Destination $deployFiles -Recurse -Force

Write-Host "✅ Deployment package created: $deployFiles\" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Upload folder '$deployFiles' to your VPS" -ForegroundColor White
Write-Host "   Using WinSCP, FileZilla, or SCP command" -ForegroundColor Gray
Write-Host ""
Write-Host "2. SSH to your VPS:" -ForegroundColor White
Write-Host "   ssh root@YOUR_VPS_IP" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Follow the HOSTINGER_DEPLOYMENT.md guide" -ForegroundColor White
Write-Host ""

Write-Host "💡 Quick SCP Upload Command:" -ForegroundColor Yellow
Write-Host "   scp -r $deployFiles\* root@YOUR_VPS_IP:/var/www/jbs_app/" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Good luck with deployment!" -ForegroundColor Green
