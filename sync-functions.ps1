# PowerShell script for Supabase functions deployment
param(
    [string]$Action = "deploy"
)

Write-Host "🚀 Supabase Functions Sync Script" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow

switch ($Action.ToLower()) {
    "deploy" {
        Write-Host "📦 Deploying all functions..." -ForegroundColor Green
        npx supabase functions deploy --import-map ./import_map.json
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Functions deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Deployment failed!" -ForegroundColor Red
        }
    }
    "list" {
        Write-Host "📋 Listing functions..." -ForegroundColor Blue
        npx supabase functions list
    }
    "serve" {
        Write-Host "🔧 Starting local server..." -ForegroundColor Magenta
        npx supabase functions serve --import-map ./import_map.json
    }
    "status" {
        Write-Host "📊 Checking status..." -ForegroundColor Cyan
        npx supabase status
    }
    "config" {
        Write-Host "⚙️ Updating configuration..." -ForegroundColor Yellow
        npx supabase db reset
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Configuration updated!" -ForegroundColor Green
        } else {
            Write-Host "❌ Configuration update failed!" -ForegroundColor Red
        }
    }
    default {
        Write-Host "❓ Available actions: deploy, list, serve, status, config" -ForegroundColor White
    }
}
