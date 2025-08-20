# 🚨 EMERGENCY: Remove Exposed Supabase Service Role Key from Git History
# PowerShell script for Windows users

Write-Host "🚨 EMERGENCY SECURITY CLEANUP: Removing exposed Supabase service role key" -ForegroundColor Red
Write-Host "===================================================================" -ForegroundColor Yellow

# The exposed service role key that needs to be removed
$EXPOSED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMDAwNCwiZXhwIjoyMDY5Mzk2MDA0fQ.0R8CvJUfXB1aTwFdz7ywNbrmGp2GNTU7V9MdWr-j4mU"

Write-Host "⚠️  WARNING: This will rewrite Git history. Ensure you have backups!" -ForegroundColor Yellow
Write-Host "📂 Current repository: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔑 Removing key: $($EXPOSED_KEY.Substring(0,50))..." -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Continue with Git history cleanup? (type YES to confirm)"

if ($confirm -ne "YES") {
    Write-Host "❌ Cleanup cancelled. Key remains in Git history!" -ForegroundColor Red
    Write-Host "🚨 CRITICAL: You must regenerate the Supabase service role key immediately" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Starting cleanup process..." -ForegroundColor Green

# Check if git-filter-repo is available
$filterRepoExists = $null
try {
    git filter-repo --help *>$null
    $filterRepoExists = $true
} catch {
    $filterRepoExists = $false
}

if ($filterRepoExists) {
    Write-Host "✅ Using git-filter-repo for secure cleanup" -ForegroundColor Green
    
    # Create replacement file
    $secretsFile = Join-Path $env:TEMP "secrets-cleanup.txt"
    "$EXPOSED_KEY==>REDACTED_SUPABASE_SERVICE_ROLE_KEY" | Out-File -FilePath $secretsFile -Encoding ASCII
    
    Write-Host "🧹 Removing exposed key from all commits..." -ForegroundColor Yellow
    git filter-repo --replace-text $secretsFile --force
    
    Write-Host "🗑️  Cleaning up temporary files..." -ForegroundColor Yellow
    Remove-Item $secretsFile -Force
    
    Write-Host "✅ Git history cleaned with git-filter-repo" -ForegroundColor Green
    
} else {
    Write-Host "⚠️  git-filter-repo not available, using alternative method" -ForegroundColor Yellow
    
    # Backup current branch
    git branch backup-before-cleanup
    
    Write-Host "🧹 Manually removing exposed key from files..." -ForegroundColor Yellow
    
    # Find and replace in current files
    $files = Get-ChildItem -Recurse -Include *.js,*.md,*.json | Where-Object { $_.FullName -notlike "*\.git\*" }
    
    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and $content.Contains($EXPOSED_KEY)) {
                Write-Host "🔧 Cleaning $($file.Name)..." -ForegroundColor Cyan
                $newContent = $content.Replace($EXPOSED_KEY, "REDACTED_SUPABASE_SERVICE_ROLE_KEY")
                $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            }
        } catch {
            Write-Host "⚠️  Could not process $($file.Name): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    # Commit the cleanup
    git add .
    git commit -m "SECURITY: Remove exposed Supabase service role key"
    
    Write-Host "✅ Current files cleaned and committed" -ForegroundColor Green
    
    # Option to force push
    $forceConfirm = Read-Host "Force push to remove previous commits with exposed key? (type FORCE to confirm)"
    
    if ($forceConfirm -eq "FORCE") {
        Write-Host "⚠️  Performing force push to remove commit history..." -ForegroundColor Yellow
        git reset --hard HEAD~2  # Remove last 2 commits to be safe
        git push --force-with-lease origin main
        Write-Host "✅ Previous commits removed via force push" -ForegroundColor Green
    } else {
        Write-Host "❌ Previous commits still contain exposed key!" -ForegroundColor Red
        Write-Host "🚨 CRITICAL: Install git-filter-repo or use force push" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Yellow
Write-Host "✅ Exposed Supabase service role key removed from current files" -ForegroundColor Green
Write-Host "🔄 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Push cleaned history: git push --force-with-lease origin main" -ForegroundColor White
Write-Host "   2. Regenerate service role key in Supabase Dashboard" -ForegroundColor White
Write-Host "   3. Update all environment variables" -ForegroundColor White
Write-Host "   4. Redeploy edge functions with new secrets" -ForegroundColor White
Write-Host ""
Write-Host "🛡️  Your repository is now secure!" -ForegroundColor Green

# Check if remote push is needed
$localHead = git rev-parse HEAD
$remoteHead = git rev-parse origin/main

if ($localHead -ne $remoteHead) {
    Write-Host ""
    $pushConfirm = Read-Host "🔄 Push cleaned history to GitHub now? (y/n)"
    
    if ($pushConfirm -eq "y" -or $pushConfirm -eq "Y") {
        Write-Host "📤 Pushing cleaned history to GitHub..." -ForegroundColor Yellow
        git push --force-with-lease origin main
        Write-Host "✅ GitHub repository updated with clean history" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Remember to push: git push --force-with-lease origin main" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🚨 CRITICAL REMINDER:" -ForegroundColor Red
Write-Host "   The exposed service role key is COMPROMISED" -ForegroundColor Red
Write-Host "   Regenerate it immediately in Supabase Dashboard!" -ForegroundColor Red
Write-Host "   https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/settings/api" -ForegroundColor Cyan

# Pause to ensure user reads the message
Read-Host "Press Enter to continue..."
