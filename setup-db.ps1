# Database Setup Script for Windows
# Run this with PowerShell if database doesn't exist yet

Write-Host "🗄️  Setting up PostgreSQL database for JBS App..." -ForegroundColor Yellow
Write-Host ""

# Database configuration (change if needed)
$DB_NAME = "jbs_app"
$DB_USER = "postgres"

Write-Host "Creating database: $DB_NAME" -ForegroundColor Cyan

# Create database
$createDbCommand = "CREATE DATABASE $DB_NAME;"
psql -U $DB_USER -c $createDbCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database '$DB_NAME' created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database might already exist or there was an error." -ForegroundColor Yellow
    Write-Host "If database already exists, you can proceed to the next step." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure .env file is configured correctly" -ForegroundColor White
Write-Host "2. Run: npm run db:push" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
