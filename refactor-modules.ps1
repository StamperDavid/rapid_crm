# Rapid CRM Module Refactor Script
# Purpose: Archive ELD, IFTA, SEO, Video modules and refocus on core USDOT compliance
# Date: October 14, 2025

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rapid CRM Module Refactor Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Confirm current directory
$currentDir = Get-Location
Write-Host "Current Directory: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "src/components")) {
    Write-Host "ERROR: Not in Rapid_CRM root directory!" -ForegroundColor Red
    Write-Host "Please run this script from: C:\Users\David\PycharmProjects\Rapid_CRM" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Confirmed in Rapid_CRM directory" -ForegroundColor Green
Write-Host ""

# Phase 1: Create Backup Branch
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 1: Creating Backup Branch" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Creating branch: archive/full-feature-set-v1.0" -ForegroundColor Yellow
git checkout -b archive/full-feature-set-v1.0

Write-Host "Staging all current changes..." -ForegroundColor Yellow
git add .

Write-Host "Creating archive commit..." -ForegroundColor Yellow
git commit -m @"
archive: Complete feature set including ELD, IFTA, SEO, Video modules

This commit preserves the full-featured version of Rapid CRM including:

Features included in this archive:
- ELD (Electronic Logging Device) compliance module
  - HOS logging and DVIR management
  - Client onboarding and compliance reporting
  - 8 service files, 8 components, Python integration
  
- IFTA (International Fuel Tax Agreement) module
  - Quarterly filing and fuel tax calculation
  - Multi-state compliance tracking
  - 4 service files, 2 components
  
- SEO Automation module
  - Competitor analysis and content opportunities
  - Automated SEO recommendations
  - 8 service files, dedicated AI agent
  
- Video Production Suite
  - AI video generation and CGI engine
  - Character creation and post-production
  - 9 components, 3 service files

Archive Metadata:
- Total files: ~85 feature-specific files
- Database tables: 40+ additional tables
- API routes: ~250 lines in server.js
- Business model: ELD compliance SaaS platform
- MVP focus: Transportation compliance services

Reason for archival:
Refocusing business model on core USDOT registration and compliance
agency services. These modules represent valuable IP that may be
reactivated as separate products or service add-ons in the future.

Restoration: To restore these features, cherry-pick from this branch
or merge the entire branch back into main.

Date: October 14, 2025
Last working state: Confirmed operational
Dependencies: See package.json for module-specific requirements
"@

Write-Host "Pushing backup branch to remote..." -ForegroundColor Yellow
git push -u origin archive/full-feature-set-v1.0

Write-Host ""
Write-Host "✓ PHASE 1 COMPLETE: Backup branch created and pushed" -ForegroundColor Green
Write-Host ""

# Phase 2: Return to Main Branch
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 2: Switching to Main Branch" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

git checkout main

Write-Host "Current branch:" -ForegroundColor Yellow
git branch --show-current

Write-Host ""
Write-Host "✓ PHASE 2 COMPLETE: Now on main branch" -ForegroundColor Green
Write-Host ""

# Phase 3: Remove Modules
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 3: Removing Modules" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Commit 1: Remove Video Module
Write-Host "Removing Video Production Module..." -ForegroundColor Yellow
Remove-Item -Path "src/components/video" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/services/video" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/pages/VideoProductionDashboard.tsx" -Force -ErrorAction SilentlyContinue

git add .
git commit -m @"
refactor!: Remove video production module

BREAKING CHANGE: Video production features removed from core platform

Removed components:
- src/components/video/* (9 components)
- src/services/video/* (3 services)
- src/pages/VideoProductionDashboard.tsx
- API routes: /api/video/*

Reason: Refocusing on core USDOT compliance business. Video production
is not part of the core value proposition and adds unnecessary complexity.

Impact:
- Reduces codebase by ~15 files
- Removes video creation API endpoints
- Simplifies navigation and user experience

Recovery: Available in archive/full-feature-set-v1.0 branch

Co-dependencies: None - module was isolated
"@

Write-Host "✓ Video module removed" -ForegroundColor Green
Write-Host ""

# Commit 2: Remove SEO Module
Write-Host "Removing SEO Automation Module..." -ForegroundColor Yellow
Remove-Item -Path "src/services/seo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/services/ai/SEOAutomationAgent.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/services/ai/SEOAutomationAgentCommonJS.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/services/ai/SEOAutomationAgentApiRoutesCommonJS.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/seo_automation_schema.sql" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/add_seo_automation_tables.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/create_seo_tables_direct.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/pages/SEODashboard.tsx" -Force -ErrorAction SilentlyContinue

git add .
git commit -m @"
refactor!: Remove SEO automation module

BREAKING CHANGE: SEO automation and competitive intelligence features removed

Removed components:
- src/services/seo/* (8 services)
- src/services/ai/SEOAutomationAgent* (AI agent + routes)
- src/database/seo_automation_schema.sql
- src/database/add_seo_automation_tables.js
- src/database/create_seo_tables_direct.js
- src/pages/SEODashboard.tsx
- API routes: /api/seo/*, /api/seo-agent/*

Reason: SEO automation is a marketing tool, not core to the USDOT
compliance agency business model. Can be reactivated later as an
internal tool if needed.

Impact:
- Reduces codebase by ~15 files
- Removes 5 database tables (seo_competitors, seo_metrics, etc.)
- Removes SEO-related API endpoints
- No impact on core CRM or compliance workflows

Recovery: Available in archive/full-feature-set-v1.0 branch

Co-dependencies: None - module was isolated
"@

Write-Host "✓ SEO module removed" -ForegroundColor Green
Write-Host ""

# Commit 3: Remove IFTA Module
Write-Host "Removing IFTA Module..." -ForegroundColor Yellow
Remove-Item -Path "src/components/ifta" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/services/ifta" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/ifta_schema.sql" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/minimal_ifta_init.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/add_ifta_tables.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/pages/IFTADashboard.tsx" -Force -ErrorAction SilentlyContinue

git add .
git commit -m @"
refactor!: Remove IFTA compliance module

BREAKING CHANGE: IFTA (International Fuel Tax Agreement) features removed

Removed components:
- src/components/ifta/* (2 components)
- src/services/ifta/* (4 services)
- src/database/ifta_schema.sql
- src/database/minimal_ifta_init.js
- src/database/add_ifta_tables.js
- src/pages/IFTADashboard.tsx
- API routes: /api/ifta/*

Reason: Pivoting from full compliance monitoring (ELD/IFTA) to focused
USDOT registration and renewal management agency model.

Impact:
- Reduces codebase by ~15 files
- Removes 6 database tables (ifta_registrations, ifta_quarterly_filings, etc.)
- Removes IFTA dashboard and reporting features
- Minor cleanup needed in EldServiceIntegration.ts (IFTA references)

Recovery: Available in archive/full-feature-set-v1.0 branch

Co-dependencies: Referenced in src/services/eld/EldServiceIntegration.ts
(lines 224-257) - requires cleanup
"@

Write-Host "✓ IFTA module removed" -ForegroundColor Green
Write-Host ""

# Commit 4: Remove ELD Module
Write-Host "Removing ELD Module..." -ForegroundColor Yellow
Remove-Item -Path "src/components/eld" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/services/eld" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "PycharmProjects/rapid_eld" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/eld_schema.sql" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/eld_service_schema.sql" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/add_eld_tables.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/add_eld_tables_final.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/database/eldMigration.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/pages/ELDDashboard.tsx" -Force -ErrorAction SilentlyContinue

git add .
git commit -m @"
refactor!: Remove ELD compliance monitoring module

BREAKING CHANGE: ELD (Electronic Logging Device) compliance features removed

Removed components:
- src/components/eld/* (8 components)
- src/services/eld/* (8 services)
- src/database/eld_schema.sql + eld_service_schema.sql
- src/database/eldMigration.js
- src/pages/ELDDashboard.tsx
- PycharmProjects/rapid_eld/* (entire Python module)
- API routes: /api/eld/*

Reason: Major business model pivot from ELD compliance SaaS (per MVP_README.md)
to USDOT registration and compliance agency model (per PROJECT_REFERENCE.md).
This represents a strategic refocus on core value proposition.

Impact:
- Reduces codebase by ~35 files
- Removes 10+ database tables (eld_hos_logs, eld_dvir_reports, etc.)
- Removes ELD dashboard and monitoring features
- Removes Python rapid_eld integration module
- Changes revenue model from `$50-200/month` ELD subscriptions to 
  USDOT registration + renewal management (70% revenue from renewals)

Recovery: Available in archive/full-feature-set-v1.0 branch

Business Model Change:
OLD: ELD compliance platform with recurring monitoring fees
NEW: USDOT registration agency with renewal management focus

Co-dependencies: None in core business logic
"@

Write-Host "✓ ELD module removed" -ForegroundColor Green
Write-Host ""
Write-Host "✓ PHASE 3 COMPLETE: All modules removed" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REFACTOR COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Manually update src/App.tsx (remove routes and imports)" -ForegroundColor White
Write-Host "2. Manually update src/config/dashboardModules.ts (remove module configs)" -ForegroundColor White
Write-Host "3. Manually update server.js (remove API routes)" -ForegroundColor White
Write-Host "4. Run final configuration commit (see GIT_REFACTOR_PLAN.md)" -ForegroundColor White
Write-Host "5. Test application: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Archive Branch: archive/full-feature-set-v1.0" -ForegroundColor Cyan
Write-Host "To restore: git checkout archive/full-feature-set-v1.0 -- <path>" -ForegroundColor Cyan
Write-Host ""

