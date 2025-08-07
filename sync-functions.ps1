#!/usr/bin/env pwsh
# Supabase Edge Functions Sync Script
# Usage: .\sync-functions.ps1 [command]
# Commands: deploy, list, logs, serve, help

param(
    [string]$Command = "deploy",
    [string]$FunctionName = "",
    [switch]$WithLogs = $false,
    [switch]$Help = $false
)

# Colors for output
$Green = "`e[32m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

function Show-Help {
    Write-ColorOutput "🚀 Supabase Edge Functions Sync Tool" $Blue
    Write-ColorOutput "=====================================`n" $Blue
    
    Write-ColorOutput "USAGE:" $Yellow
    Write-Host "  .\sync-functions.ps1 [command] [options]`n"
    
    Write-ColorOutput "COMMANDS:" $Yellow
    Write-Host "  deploy          Deploy all functions to cloud (default)"
    Write-Host "  deploy <name>   Deploy specific function"
    Write-Host "  list            List all functions and their status"
    Write-Host "  logs <name>     View logs for specific function"
    Write-Host "  serve           Start local development server"
    Write-Host "  status          Check Supabase project status"
    Write-Host "  help            Show this help message`n"
    
    Write-ColorOutput "OPTIONS:" $Yellow
    Write-Host "  -WithLogs       Show logs after deployment"
    Write-Host "  -Help           Show this help message`n"
    
    Write-ColorOutput "EXAMPLES:" $Yellow
    Write-Host "  .\sync-functions.ps1                           # Deploy all functions"
    Write-Host "  .\sync-functions.ps1 deploy send-confirmation-email  # Deploy specific function"
    Write-Host "  .\sync-functions.ps1 list                     # List all functions"
    Write-Host "  .\sync-functions.ps1 logs send-confirmation-email    # View function logs"
    Write-Host "  .\sync-functions.ps1 serve                    # Start local server"
}

function Test-SupabaseInstalled {
    try {
        $null = npx supabase --version 2>$null
        return $true
    }
    catch {
        Write-ColorOutput "❌ Error: Supabase CLI not found. Please install it first." $Red
        Write-ColorOutput "Run: npm install supabase" $Yellow
        return $false
    }
}

function Deploy-Functions {
    param([string]$SpecificFunction = "")
    
    Write-ColorOutput "🚀 Starting deployment..." $Blue
    
    if ($SpecificFunction) {
        Write-ColorOutput "📦 Deploying function: $SpecificFunction" $Yellow
        npx supabase functions deploy $SpecificFunction --import-map ./import_map.json
    } else {
        Write-ColorOutput "📦 Deploying all functions..." $Yellow
        npx supabase functions deploy --import-map ./import_map.json
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Deployment successful!" $Green
        if ($WithLogs -and $SpecificFunction) {
            Write-ColorOutput "📋 Fetching logs..." $Blue
            npx supabase functions logs $SpecificFunction
        }
    } else {
        Write-ColorOutput "❌ Deployment failed!" $Red
    }
}

function List-Functions {
    Write-ColorOutput "📋 Listing all functions..." $Blue
    npx supabase functions list
}

function Show-Logs {
    param([string]$FunctionName)
    
    if (-not $FunctionName) {
        Write-ColorOutput "❌ Error: Function name required for logs command" $Red
        Write-ColorOutput "Usage: .\sync-functions.ps1 logs <function-name>" $Yellow
        return
    }
    
    Write-ColorOutput "📋 Showing logs for: $FunctionName" $Blue
    npx supabase functions logs $FunctionName
}

function Start-LocalServer {
    Write-ColorOutput "🔧 Starting local development server..." $Blue
    Write-ColorOutput "Note: This requires Docker to be running" $Yellow
    npx supabase functions serve
}

function Check-Status {
    Write-ColorOutput "📊 Checking Supabase project status..." $Blue
    npx supabase status
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

if (-not (Test-SupabaseInstalled)) {
    exit 1
}

Write-ColorOutput "`n🎯 Supabase Edge Functions Sync Tool" $Blue
Write-ColorOutput "======================================`n" $Blue

switch ($Command.ToLower()) {
    "deploy" { 
        Deploy-Functions -SpecificFunction $FunctionName 
        Write-ColorOutput "`n🔗 View your functions: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/functions" $Blue
    }
    "list" { List-Functions }
    "logs" { Show-Logs -FunctionName $FunctionName }
    "serve" { Start-LocalServer }
    "status" { Check-Status }
    "help" { Show-Help }
    default { 
        Write-ColorOutput "❌ Unknown command: $Command" $Red
        Write-ColorOutput "Run '.\sync-functions.ps1 help' for usage information" $Yellow
    }
}

Write-ColorOutput "`n✨ Done!" $Green
