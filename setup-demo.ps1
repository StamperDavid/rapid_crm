# Rapid CRM ELD Service - Demo Environment Setup
# This script sets up a demo environment for investor presentations

Write-Host "🎬 Rapid CRM ELD Service - Demo Environment Setup" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta

# Create demo data
Write-Host "📊 Creating demo data..." -ForegroundColor Yellow

# Create demo companies
$demoCompanies = @"
INSERT OR REPLACE INTO companies (id, name, usdot_number, mc_number, contact_person, email, phone, address, city, state, zip_code, fleet_size, status, created_at, updated_at) VALUES
('demo_company_1', 'ABC Trucking Co.', '123456', 'MC-789012', 'John Smith', 'john@abctrucking.com', '(555) 123-4567', '123 Truck Lane', 'Dallas', 'TX', '75201', 25, 'active', datetime('now'), datetime('now')),
('demo_company_2', 'XYZ Logistics', '789012', 'MC-345678', 'Sarah Johnson', 'sarah@xyzlogistics.com', '(555) 987-6543', '456 Freight Blvd', 'Atlanta', 'GA', '30309', 80, 'active', datetime('now'), datetime('now')),
('demo_company_3', 'Elite Transport', '345678', 'MC-901234', 'Mike Davis', 'mike@elitetransport.com', '(555) 456-7890', '789 Highway Dr', 'Phoenix', 'AZ', '85001', 45, 'active', datetime('now'), datetime('now')),
('demo_company_4', 'Swift Haulers', '901234', 'MC-567890', 'Lisa Wilson', 'lisa@swifthaulers.com', '(555) 321-0987', '321 Cargo Way', 'Denver', 'CO', '80202', 60, 'active', datetime('now'), datetime('now')),
('demo_company_5', 'Premier Freight', '567890', 'MC-123456', 'Robert Brown', 'robert@premierfreight.com', '(555) 654-3210', '654 Logistics Ave', 'Seattle', 'WA', '98101', 35, 'active', datetime('now'), datetime('now'));
"@

# Create demo ELD clients
$demoClients = @"
INSERT OR REPLACE INTO eld_clients (id, company_id, company_name, contact_person, email, phone, service_package, status, start_date, monthly_revenue, total_trucks, compliance_score, last_audit, created_at, updated_at) VALUES
('demo_client_1', 'demo_company_1', 'ABC Trucking Co.', 'John Smith', 'john@abctrucking.com', '(555) 123-4567', 'standard', 'active', '2024-01-15', 1000, 25, 95, '2024-11-15', datetime('now'), datetime('now')),
('demo_client_2', 'demo_company_2', 'XYZ Logistics', 'Sarah Johnson', 'sarah@xyzlogistics.com', '(555) 987-6543', 'premium', 'active', '2024-03-01', 4000, 80, 98, '2024-10-20', datetime('now'), datetime('now')),
('demo_client_3', 'demo_company_3', 'Elite Transport', 'Mike Davis', 'mike@elitetransport.com', '(555) 456-7890', 'basic', 'active', '2024-02-10', 500, 45, 87, '2024-12-01', datetime('now'), datetime('now')),
('demo_client_4', 'demo_company_4', 'Swift Haulers', 'Lisa Wilson', 'lisa@swifthaulers.com', '(555) 321-0987', 'standard', 'active', '2024-04-05', 2000, 60, 92, '2024-11-30', datetime('now'), datetime('now')),
('demo_client_5', 'demo_company_5', 'Premier Freight', 'Robert Brown', 'robert@premierfreight.com', '(555) 654-3210', 'premium', 'active', '2024-05-20', 3500, 35, 96, '2024-12-10', datetime('now'), datetime('now'));
"@

# Create demo revenue data
$demoRevenue = @"
INSERT OR REPLACE INTO revenue_data (id, month, recurring_revenue, setup_fees, consulting_fees, total_revenue, created_at, updated_at) VALUES
('revenue_1', 'Oct 2024', 15000, 5000, 3000, 23000, datetime('now'), datetime('now')),
('revenue_2', 'Nov 2024', 18000, 2000, 2500, 22500, datetime('now'), datetime('now')),
('revenue_3', 'Dec 2024', 20000, 3000, 4000, 27000, datetime('now'), datetime('now')),
('revenue_4', 'Jan 2025', 22000, 4000, 3500, 29500, datetime('now'), datetime('now')),
('revenue_5', 'Feb 2025', 25000, 1500, 2000, 28500, datetime('now'), datetime('now')),
('revenue_6', 'Mar 2025', 28000, 6000, 5000, 39000, datetime('now'), datetime('now'));
"@

# Create demo compliance alerts
$demoAlerts = @"
INSERT OR REPLACE INTO compliance_alerts (id, client_id, client_name, alert_type, severity, title, message, due_date, status, created_at, updated_at) VALUES
('alert_1', 'demo_client_1', 'ABC Trucking Co.', 'audit_required', 'high', 'Annual DOT Audit Due', 'ABC Trucking Co. annual DOT audit is due within 30 days', '2024-12-15', 'open', datetime('now'), datetime('now')),
('alert_2', 'demo_client_2', 'XYZ Logistics', 'service_renewal', 'medium', 'Service Renewal Due', 'XYZ Logistics service contract expires in 60 days', '2025-01-01', 'open', datetime('now'), datetime('now')),
('alert_3', 'demo_client_3', 'Elite Transport', 'compliance_violation', 'high', 'HOS Violation Detected', 'Driver reported HOS violation requiring immediate attention', '2024-12-20', 'open', datetime('now'), datetime('now')),
('alert_4', 'demo_client_4', 'Swift Haulers', 'payment_overdue', 'medium', 'Payment Overdue', 'Monthly payment is 5 days overdue', '2024-12-10', 'open', datetime('now'), datetime('now')),
('alert_5', 'demo_client_5', 'Premier Freight', 'audit_required', 'low', 'Quarterly Review', 'Quarterly compliance review scheduled', '2025-01-15', 'open', datetime('now'), datetime('now'));
"@

# Execute demo data creation
Write-Host "📝 Adding demo companies..." -ForegroundColor Yellow
sqlite3 instance/rapid_crm.db "$demoCompanies"

Write-Host "📝 Adding demo ELD clients..." -ForegroundColor Yellow
sqlite3 instance/rapid_crm.db "$demoClients"

Write-Host "📝 Adding demo revenue data..." -ForegroundColor Yellow
sqlite3 instance/rapid_crm.db "$demoRevenue"

Write-Host "📝 Adding demo compliance alerts..." -ForegroundColor Yellow
sqlite3 instance/rapid_crm.db "$demoAlerts"

# Create demo presentation script
$presentationScript = @"
# Rapid CRM ELD Service - Investor Demo Script
# Use this script to guide your investor presentation

Write-Host "🎯 Investor Demo Presentation Guide" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. 🏢 Company Overview (2 minutes)" -ForegroundColor Cyan
Write-Host "   • Show the main dashboard with key metrics" -ForegroundColor White
Write-Host "   • Highlight: $11,000 monthly recurring revenue" -ForegroundColor White
Write-Host "   • Highlight: 5 active clients with 245 total trucks" -ForegroundColor White
Write-Host "   • Highlight: 93.6% average compliance score" -ForegroundColor White

Write-Host ""
Write-Host "2. 💰 Revenue Model (3 minutes)" -ForegroundColor Cyan
Write-Host "   • Navigate to Revenue tab" -ForegroundColor White
Write-Host "   • Show recurring revenue growth: $15K → $28K" -ForegroundColor White
Write-Host "   • Show setup fees and consulting revenue" -ForegroundColor White
Write-Host "   • Highlight: $390K annual run rate" -ForegroundColor White

Write-Host ""
Write-Host "3. 🚛 ELD Service Platform (5 minutes)" -ForegroundColor Cyan
Write-Host "   • Show client onboarding flow" -ForegroundColor White
Write-Host "   • Demonstrate payment integration" -ForegroundColor White
Write-Host "   • Show compliance monitoring" -ForegroundColor White
Write-Host "   • Highlight: Real-time ELD data integration" -ForegroundColor White

Write-Host ""
Write-Host "4. 📊 Analytics & Reporting (3 minutes)" -ForegroundColor Cyan
Write-Host "   • Navigate to Analytics tab" -ForegroundColor White
Write-Host "   • Show compliance overview" -ForegroundColor White
Write-Host "   • Show client performance metrics" -ForegroundColor White
Write-Host "   • Highlight: Proactive compliance management" -ForegroundColor White

Write-Host ""
Write-Host "5. 🚀 Market Opportunity (2 minutes)" -ForegroundColor Cyan
Write-Host "   • 500,000+ trucking companies in US" -ForegroundColor White
Write-Host "   • ELD compliance is mandatory (not optional)" -ForegroundColor White
Write-Host "   • Average ELD service: $100-300/month per truck" -ForegroundColor White
Write-Host "   • Our pricing: $50-200/month with setup fees" -ForegroundColor White

Write-Host ""
Write-Host "6. 💡 Technology & AI (2 minutes)" -ForegroundColor Cyan
Write-Host "   • Show AI-powered assistance" -ForegroundColor White
Write-Host "   • Demonstrate automated compliance monitoring" -ForegroundColor White
Write-Host "   • Show video creation capabilities" -ForegroundColor White
Write-Host "   • Highlight: Scalable SaaS platform" -ForegroundColor White

Write-Host ""
Write-Host "7. 📈 Growth Projections (3 minutes)" -ForegroundColor Cyan
Write-Host "   • Current: 5 clients, $11K MRR" -ForegroundColor White
Write-Host "   • 6 months: 25 clients, $50K MRR" -ForegroundColor White
Write-Host "   • 12 months: 100 clients, $200K MRR" -ForegroundColor White
Write-Host "   • 24 months: 500 clients, $1M MRR" -ForegroundColor White

Write-Host ""
Write-Host "8. 💰 Funding Ask (2 minutes)" -ForegroundColor Cyan
Write-Host "   • Seeking: $500K seed funding" -ForegroundColor White
Write-Host "   • Use of funds: Sales team, marketing, product development" -ForegroundColor White
Write-Host "   • Milestone: 100 clients, $200K MRR in 12 months" -ForegroundColor White
Write-Host "   • Exit strategy: Strategic acquisition or IPO" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Key Talking Points:" -ForegroundColor Yellow
Write-Host "• 'We're building the Shopify of ELD compliance'" -ForegroundColor White
Write-Host "• 'Mandatory compliance creates a captive market'" -ForegroundColor White
Write-Host "• 'Recurring revenue model with high retention'" -ForegroundColor White
Write-Host "• 'AI-powered automation reduces operational costs'" -ForegroundColor White
Write-Host "• 'Proven traction with paying customers'" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Demo Environment Ready!" -ForegroundColor Green
"@

Set-Content -Path "demo-presentation.ps1" -Value $presentationScript

Write-Host ""
Write-Host "✅ Demo environment setup complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Demo Data Created:" -ForegroundColor Cyan
Write-Host "   • 5 demo companies with realistic data" -ForegroundColor White
Write-Host "   • 5 ELD service clients with varying compliance scores" -ForegroundColor White
Write-Host "   • 6 months of revenue data showing growth" -ForegroundColor White
Write-Host "   • 5 compliance alerts for demonstration" -ForegroundColor White
Write-Host ""
Write-Host "🎬 Presentation Script:" -ForegroundColor Cyan
Write-Host "   • Run: .\demo-presentation.ps1" -ForegroundColor White
Write-Host "   • Follow the 22-minute investor presentation guide" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready for Investor Demo!" -ForegroundColor Green

