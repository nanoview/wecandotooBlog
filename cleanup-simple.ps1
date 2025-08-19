# Unused Files Cleanup Script
# Safe automated cleanup for Windows PowerShell

param(
    [switch]$DryRun = $false
)

Write-Host "🧹 Starting Unused Files Cleanup..." -ForegroundColor Cyan

# Create backup first
if (-not $DryRun) {
    Write-Host "📦 Creating backup branch..." -ForegroundColor Green
    git branch "backup-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    git add .
    git commit -m "Backup before cleanup"
}

# Phase 1: Google Site Kit Legacy Files
Write-Host "`n🗑️ Phase 1: Google Site Kit Files..." -ForegroundColor Green
$googleFiles = @(
    "src\components\GoogleSiteKit.tsx",
    "src\components\GoogleSiteKitConfigPanel.tsx", 
    "src\components\GoogleSiteKitManager.tsx",
    "src\components\GoogleSiteKitSimple.tsx",
    "src\components\StellarGoogleSiteKit.tsx",
    "src\components\StellarGoogleSiteKitDashboard.tsx",
    "src\components\TestGoogleSiteKit.tsx",
    "src\components\WordPressSiteKitIntegration.tsx",
    "src\components\WordPressSiteKitOAuth.tsx",
    "src\services\googleSiteKitService.ts",
    "src\services\stellarSiteKitConfig.ts",
    "src\examples\googleSiteKitExample.ts"
)

foreach ($file in $googleFiles) {
    if (Test-Path $file) {
        if ($DryRun) {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        } else {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        }
    }
}

# Phase 2: WordPress Files
Write-Host "`n🗑️ Phase 2: WordPress Files..." -ForegroundColor Green
$wpFiles = @(
    "src\scripts\syncWordPress.ts",
    "src\services\wordpressSyncService.ts",
    "src\utils\contentNormalizer.ts", 
    "src\utils\wordpressImport.ts"
)

foreach ($file in $wpFiles) {
    if (Test-Path $file) {
        if ($DryRun) {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        } else {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        }
    }
}

# Phase 3: Unused UI Components
Write-Host "`n🗑️ Phase 3: Unused UI Components..." -ForegroundColor Green
$uiFiles = @(
    "src\components\ui\accordion.tsx",
    "src\components\ui\aspect-ratio.tsx",
    "src\components\ui\breadcrumb.tsx",
    "src\components\ui\calendar.tsx",
    "src\components\ui\carousel.tsx",
    "src\components\ui\chart.tsx",
    "src\components\ui\checkbox.tsx",
    "src\components\ui\collapsible.tsx",
    "src\components\ui\command.tsx",
    "src\components\ui\context-menu.tsx",
    "src\components\ui\drawer.tsx",
    "src\components\ui\form.tsx",
    "src\components\ui\hover-card.tsx",
    "src\components\ui\input-otp.tsx",
    "src\components\ui\menubar.tsx",
    "src\components\ui\navigation-menu.tsx",
    "src\components\ui\pagination.tsx",
    "src\components\ui\popover.tsx",
    "src\components\ui\radio-group.tsx",
    "src\components\ui\resizable.tsx",
    "src\components\ui\scroll-area.tsx",
    "src\components\ui\sidebar.tsx",
    "src\components\ui\skeleton.tsx",
    "src\components\ui\slider.tsx",
    "src\components\ui\use-toast.ts"
)

foreach ($file in $uiFiles) {
    if (Test-Path $file) {
        if ($DryRun) {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        } else {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        }
    }
}

# Phase 4: Test/Experimental Components
Write-Host "`n🗑️ Phase 4: Test Components..." -ForegroundColor Green
$testFiles = @(
    "src\components\AutoAdSense.tsx",
    "src\components\CriticalCSS.tsx",
    "src\components\DatabaseExplorer.tsx",
    "src\components\FormatTestComponent.tsx",
    "src\components\GoogleAd2.tsx",
    "src\components\GoogleAnalytics.tsx",
    "src\components\LazyImage.tsx",
    "src\components\admin\SecurityAudit.tsx"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        if ($DryRun) {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        } else {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        }
    }
}

# Phase 5: Additional Files
Write-Host "`n🗑️ Phase 5: Additional Files..." -ForegroundColor Green
$additionalFiles = @(
    "src\services\emailChecker.ts",
    "src\services\googleDataService-new.ts",
    "src\services\stellarAdSenseService.ts",
    "src\services\stellarAnalyticsService.ts",
    "src\services\stellarPageSpeedService.ts",
    "src\services\stellarSearchConsoleService.ts",
    "src\services\zohoMail.ts",
    "src\utils\testAISEOStorage.ts",
    "src\components\layout\NavigationBreadcrumb.tsx",
    "src\components\layout\NavigationTabs.tsx",
    "src\components\WebsiteSearchBarComponent.tsx",
    "src\components\ZohoMailSignup.tsx",
    "src\components\admin\AccessControlManager.tsx",
    "src\components\admin\RoleManager.tsx"
)

foreach ($file in $additionalFiles) {
    if (Test-Path $file) {
        if ($DryRun) {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        } else {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        }
    }
}

# Phase 6: Remove Dependencies
Write-Host "`n📦 Phase 6: Removing Dependencies..." -ForegroundColor Green
if ($DryRun) {
    Write-Host "[DRY RUN] Would remove these dependencies:" -ForegroundColor Gray
    Write-Host "  @radix-ui/react-accordion @radix-ui/react-aspect-ratio" -ForegroundColor Gray
    Write-Host "  @radix-ui/react-checkbox @radix-ui/react-collapsible" -ForegroundColor Gray
    Write-Host "  @radix-ui/react-context-menu @radix-ui/react-hover-card" -ForegroundColor Gray
    Write-Host "  @radix-ui/react-menubar @radix-ui/react-navigation-menu" -ForegroundColor Gray
    Write-Host "  @radix-ui/react-popover @radix-ui/react-radio-group" -ForegroundColor Gray
    Write-Host "  @radix-ui/react-scroll-area @radix-ui/react-slider" -ForegroundColor Gray
    Write-Host "  @hookform/resolvers cmdk dompurify @types/dompurify" -ForegroundColor Gray
    Write-Host "  dotenv embla-carousel-react input-otp mysql2" -ForegroundColor Gray
    Write-Host "  node-cron @types/node-cron react-day-picker" -ForegroundColor Gray
    Write-Host "  react-resizable-panels recharts supabase-cli" -ForegroundColor Gray
    Write-Host "  tailwindcss-animate vaul zod" -ForegroundColor Gray
} else {
    Write-Host "🔄 Removing unused npm packages..." -ForegroundColor Yellow
    npm uninstall @radix-ui/react-accordion @radix-ui/react-aspect-ratio @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-slider @hookform/resolvers cmdk dompurify @types/dompurify dotenv embla-carousel-react input-otp mysql2 node-cron @types/node-cron react-day-picker react-resizable-panels recharts supabase-cli tailwindcss-animate vaul zod
}

# Phase 7: Test Build
Write-Host "`n🔍 Phase 7: Testing Build..." -ForegroundColor Green
if ($DryRun) {
    Write-Host "[DRY RUN] Would run npm run build" -ForegroundColor Gray
} else {
    Write-Host "🔄 Running build test..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Cleanup Complete!" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "💡 This was a DRY RUN. Run without -DryRun to execute." -ForegroundColor Yellow
} else {
    Write-Host "✅ Files cleaned up successfully!" -ForegroundColor Green
}
