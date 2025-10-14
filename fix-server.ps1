# Fix server.js - Remove deleted module references

Write-Host "Fixing server.js - Removing deleted module references..." -ForegroundColor Yellow

# Read the file
$content = Get-Content server.js -Raw

# Remove IFTA require
$content = $content -replace "const \{ createIFTACompliance.*?\n", "// IFTA Service - REMOVED`n"

# Remove ELD require  
$content = $content -replace "const \{ createELDCompliance.*?\n", "// ELD Service - REMOVED`n"

# Remove Video require
$content = $content -replace "const VideoCreationService = require.*?\n", "// Video Service - REMOVED`n"

# Remove SEO requires (multiple lines)
$content = $content -replace "(?s)// SEO Automation Service Integration.*?const \{ createTrendingContentApiRoutes.*?\n", "// SEO Services - REMOVED`n"

# Remove VideoCreationService initialization
$content = $content -replace "(?s)// Initialize Video Creation Service.*?console\.log\('🎬 Video Creation Service initialized'\);", "// Video Service init - REMOVED"

# Remove ELD API initialization blocks
$content = $content -replace "(?s)// Initialize ELD Compliance.*?console\.warn\('⚠️  ELD endpoints will not be available'\);.*?\}", "// ELD API routes - REMOVED"

# Remove IFTA API initialization
$content = $content -replace "(?s)// Initialize IFTA Compliance.*?console\.warn\('⚠️  IFTA endpoints will not be available'\);.*?\}", "// IFTA API routes - REMOVED"

# Remove SEO API initialization
$content = $content -replace "(?s)// Initialize SEO Automation.*?console\.warn\('⚠️  SEO endpoints will not be available'\);.*?\}", "// SEO API routes - REMOVED"

# Remove ELD migration code
$content = $content -replace "(?s)const \{ runEldMigration.*?console\.warn\('⚠️  ELD features may not be available'\);.*?\}", "// ELD migration - REMOVED"

# Write back
$content | Out-File -FilePath server.js -Encoding UTF8 -NoNewline

Write-Host "✓ server.js references removed" -ForegroundColor Green
Write-Host "Note: Manual cleanup of API endpoint implementations (lines 2320-3880) still needed" -ForegroundColor Yellow

