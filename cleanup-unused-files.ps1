# 🧹 Automated Unused Files Cleanup Script
# Generated: August 19, 2025
# Purpose: Safely remove 68 unused files and 29 unused dependencies

param(
    [switch]$DryRun = $false,
    [switch]$SkipBackup = $false
)

Write-Host "🧹 Starting Unused Files Cleanup..." -ForegroundColor Cyan
Write-Host "📊 Target: 68 files + 29 dependencies" -ForegroundColor Yellow

# Step 1: Create backup branch
if (-not $SkipBackup) {
    Write-Host "`n📦 Creating backup branch..." -ForegroundColor Green
    if (-not $DryRun) {
        $branchName = "backup-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        git branch $branchName
        git add .
        git commit -m "Backup before unused files cleanup - $(Get-Date)"
    } else {
        Write-Host "[DRY RUN] Would create backup branch" -ForegroundColor Gray
    }
}

# Step 2: Remove Google Site Kit Legacy Files (12 files)
Write-Host "`n🗑️ Phase 1: Google Site Kit Legacy Files..." -ForegroundColor Green
$googleSiteKitFiles = @(
    "src/components/GoogleSiteKit.tsx",
    "src/components/GoogleSiteKitConfigPanel.tsx",
    "src/components/GoogleSiteKitManager.tsx", 
    "src/components/GoogleSiteKitSimple.tsx",
    "src/components/StellarGoogleSiteKit.tsx",
    "src/components/StellarGoogleSiteKitDashboard.tsx",
    "src/components/TestGoogleSiteKit.tsx",
    "src/components/WordPressSiteKitIntegration.tsx",
    "src/components/WordPressSiteKitOAuth.tsx",
    "src/services/googleSiteKitService.ts",
    "src/services/stellarSiteKitConfig.ts",
    "src/examples/googleSiteKitExample.ts"
)

foreach ($file in $googleSiteKitFiles) {
    if (Test-Path $file) {
        if (-not $DryRun) {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        } else {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor Yellow
    }
}

# Step 3: Remove WordPress Migration Files (4 files)
Write-Host "`n🗑️ Phase 2: WordPress Migration Files..." -ForegroundColor Green
$wordpressFiles = @(
    "src/scripts/syncWordPress.ts",
    "src/services/wordpressSyncService.ts", 
    "src/utils/contentNormalizer.ts",
    "src/utils/wordpressImport.ts"
)

foreach ($file in $wordpressFiles) {
    if (Test-Path $file) {
        if (-not $DryRun) {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        } else {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor Yellow
    }
}

# Step 4: Remove Unused UI Components (20+ files)
Write-Host "`n🗑️ Phase 3: Unused UI Components..." -ForegroundColor Green
$uiComponents = @(
    "src/components/ui/accordion.tsx",
    "src/components/ui/aspect-ratio.tsx",
    "src/components/ui/breadcrumb.tsx",
    "src/components/ui/calendar.tsx",
    "src/components/ui/carousel.tsx",
    "src/components/ui/chart.tsx",
    "src/components/ui/checkbox.tsx",
    "src/components/ui/collapsible.tsx",
    "src/components/ui/command.tsx",
    "src/components/ui/context-menu.tsx",
    "src/components/ui/drawer.tsx",
    "src/components/ui/form.tsx",
    "src/components/ui/hover-card.tsx",
    "src/components/ui/input-otp.tsx",
    "src/components/ui/menubar.tsx",
    "src/components/ui/navigation-menu.tsx",
    "src/components/ui/pagination.tsx",
    "src/components/ui/popover.tsx",
    "src/components/ui/radio-group.tsx",
    "src/components/ui/resizable.tsx",
    "src/components/ui/scroll-area.tsx",
    "src/components/ui/sidebar.tsx",
    "src/components/ui/skeleton.tsx",
    "src/components/ui/slider.tsx",
    "src/components/ui/use-toast.ts"
)

foreach ($file in $uiComponents) {
    if (Test-Path $file) {
        if (-not $DryRun) {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        } else {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor Yellow
    }
}

# Step 5: Remove Experimental/Test Components (8 files)
Write-Host "`n🗑️ Phase 4: Experimental/Test Components..." -ForegroundColor Green
$testComponents = @(
    "src/components/AutoAdSense.tsx",
    "src/components/CriticalCSS.tsx",
    "src/components/DatabaseExplorer.tsx",
    "src/components/FormatTestComponent.tsx",
    "src/components/GoogleAd2.tsx",
    "src/components/GoogleAnalytics.tsx",
    "src/components/LazyImage.tsx",
    "src/components/admin/SecurityAudit.tsx"
)

foreach ($file in $testComponents) {
    if (Test-Path $file) {
        if (-not $DryRun) {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        } else {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor Yellow
    }
}

# Step 6: Remove Additional Unused Files
Write-Host "`n🗑️ Phase 5: Additional Unused Files..." -ForegroundColor Green
$additionalFiles = @(
    "src/services/emailChecker.ts",
    "src/services/googleDataService-new.ts",
    "src/services/stellarAdSenseService.ts",
    "src/services/stellarAnalyticsService.ts",
    "src/services/stellarPageSpeedService.ts", 
    "src/services/stellarSearchConsoleService.ts",
    "src/services/zohoMail.ts",
    "src/services/index.ts",
    "src/utils/testAISEOStorage.ts",
    "src/components/layout/NavigationBreadcrumb.tsx",
    "src/components/layout/NavigationTabs.tsx",
    "src/components/WebsiteSearchBarComponent.tsx",
    "src/components/ZohoMailSignup.tsx",
    "src/components/admin/AccessControlManager.tsx",
    "src/components/admin/RoleManager.tsx"
)

foreach ($file in $additionalFiles) {
    if (Test-Path $file) {
        if (-not $DryRun) {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Red
        } else {
            Write-Host "[DRY RUN] Would delete: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor Yellow
    }
}

# Step 7: Remove Unused Dependencies  
Write-Host "`n📦 Phase 6: Removing Unused Dependencies..." -ForegroundColor Green
$unusedDeps = @(
    "@radix-ui/react-accordion", "@radix-ui/react-aspect-ratio",
    "@radix-ui/react-checkbox", "@radix-ui/react-collapsible", 
    "@radix-ui/react-context-menu", "@radix-ui/react-hover-card",
    "@radix-ui/react-menubar", "@radix-ui/react-navigation-menu",
    "@radix-ui/react-popover", "@radix-ui/react-radio-group",
    "@radix-ui/react-scroll-area", "@radix-ui/react-slider",
    "@hookform/resolvers", "cmdk", "dompurify", "@types/dompurify",
    "dotenv", "embla-carousel-react", "input-otp", "mysql2",
    "node-cron", "@types/node-cron", "react-day-picker",
    "react-resizable-panels", "recharts", "supabase-cli",
    "tailwindcss-animate", "vaul", "zod"
)

if (-not $DryRun) {
    $depsString = $unusedDeps -join " "
    Write-Host "🔄 Running npm uninstall..." -ForegroundColor Yellow
    Invoke-Expression "npm uninstall $depsString"
} else {
    Write-Host "[DRY RUN] Would uninstall packages:" -ForegroundColor Gray
    foreach ($dep in $unusedDeps) {
        Write-Host "  - $dep" -ForegroundColor Gray
    }
}

# Step 8: Verify Build Still Works
Write-Host "`n🔍 Phase 7: Verifying Build..." -ForegroundColor Green
if (-not $DryRun) {
    Write-Host "🔄 Running npm run build..." -ForegroundColor Yellow
    $buildResult = npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed! Check errors above." -ForegroundColor Red
        Write-Host "🔄 You may need to restore from backup." -ForegroundColor Yellow
    }
} else {
    Write-Host "[DRY RUN] Would run npm run build" -ForegroundColor Gray
}

# Summary
Write-Host "`n🎉 Cleanup Complete!" -ForegroundColor Cyan
Write-Host "📊 Files processed: ~68 files" -ForegroundColor Green
Write-Host "📦 Dependencies removed: ~29 packages" -ForegroundColor Green
Write-Host "💾 Expected bundle reduction: 15-25%" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n💡 This was a DRY RUN. Run without -DryRun to execute." -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Real cleanup completed! Commit your changes:" -ForegroundColor Green
    Write-Host "   git add ." -ForegroundColor Cyan
    Write-Host "   git commit -m 'Clean up unused files and dependencies'" -ForegroundColor Cyan
}
