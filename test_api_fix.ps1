# Test API endpoints after field mapping fixes
Write-Host "🧪 Testing API endpoints after field mapping fixes..." -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:3001/api"

try {
    # Test 1: Create a contact
    Write-Host "1. Testing contacts POST endpoint..." -ForegroundColor Yellow
    $contactData = @{
        firstName = "John"
        lastName = "Doe"
        email = "john.doe@example.com"
        phone = "555-1234"
        companyId = "1"
    } | ConvertTo-Json

    $contactResponse = Invoke-WebRequest -Uri "$API_BASE/contacts" -Method POST -Body $contactData -ContentType "application/json"
    
    if ($contactResponse.StatusCode -eq 201) {
        $contact = $contactResponse.Content | ConvertFrom-Json
        Write-Host "✅ Contact created successfully" -ForegroundColor Green
        Write-Host "   Response fields: $($contact.PSObject.Properties.Name -join ', ')"
        Write-Host "   firstName field: $($contact.firstName)"
        Write-Host "   lastName field: $($contact.lastName)"
    } else {
        Write-Host "❌ Contact creation failed: $($contactResponse.StatusCode)" -ForegroundColor Red
    }

    # Test 2: Create a vehicle
    Write-Host "`n2. Testing vehicles POST endpoint..." -ForegroundColor Yellow
    $vehicleData = @{
        make = "Ford"
        model = "F-150"
        year = 2023
        vin = "1FTFW1ET5DFC12345"
        licensePlate = "ABC123"
        companyId = "1"
    } | ConvertTo-Json

    $vehicleResponse = Invoke-WebRequest -Uri "$API_BASE/vehicles" -Method POST -Body $vehicleData -ContentType "application/json"
    
    if ($vehicleResponse.StatusCode -eq 201) {
        $vehicle = $vehicleResponse.Content | ConvertFrom-Json
        Write-Host "✅ Vehicle created successfully" -ForegroundColor Green
        Write-Host "   Response fields: $($vehicle.PSObject.Properties.Name -join ', ')"
        Write-Host "   make field: $($vehicle.make)"
        Write-Host "   licensePlate field: $($vehicle.licensePlate)"
    } else {
        Write-Host "❌ Vehicle creation failed: $($vehicleResponse.StatusCode)" -ForegroundColor Red
    }

    # Test 3: Create a driver
    Write-Host "`n3. Testing drivers POST endpoint..." -ForegroundColor Yellow
    $driverData = @{
        firstName = "Jane"
        lastName = "Smith"
        licenseNumber = "CDL123456"
        phone = "555-5678"
        email = "jane.smith@example.com"
        companyId = "1"
    } | ConvertTo-Json

    $driverResponse = Invoke-WebRequest -Uri "$API_BASE/drivers" -Method POST -Body $driverData -ContentType "application/json"
    
    if ($driverResponse.StatusCode -eq 201) {
        $driver = $driverResponse.Content | ConvertFrom-Json
        Write-Host "✅ Driver created successfully" -ForegroundColor Green
        Write-Host "   Response fields: $($driver.PSObject.Properties.Name -join ', ')"
        Write-Host "   firstName field: $($driver.firstName)"
        Write-Host "   licenseNumber field: $($driver.licenseNumber)"
    } else {
        Write-Host "❌ Driver creation failed: $($driverResponse.StatusCode)" -ForegroundColor Red
    }

    # Test 4: Create a deal
    Write-Host "`n4. Testing deals POST endpoint..." -ForegroundColor Yellow
    $dealData = @{
        title = "Test Deal"
        amount = 5000
        status = "qualified"
        companyId = "1"
    } | ConvertTo-Json

    $dealResponse = Invoke-WebRequest -Uri "$API_BASE/deals" -Method POST -Body $dealData -ContentType "application/json"
    
    if ($dealResponse.StatusCode -eq 201) {
        $deal = $dealResponse.Content | ConvertFrom-Json
        Write-Host "✅ Deal created successfully" -ForegroundColor Green
        Write-Host "   Response fields: $($deal.PSObject.Properties.Name -join ', ')"
        Write-Host "   title field: $($deal.title)"
        Write-Host "   amount field: $($deal.amount)"
    } else {
        Write-Host "❌ Deal creation failed: $($dealResponse.StatusCode)" -ForegroundColor Red
    }

    # Test 5: Create a lead
    Write-Host "`n5. Testing leads POST endpoint..." -ForegroundColor Yellow
    $leadData = @{
        name = "Test Lead"
        email = "lead@example.com"
        phone = "555-9999"
        companyId = "1"
        status = "New"
    } | ConvertTo-Json

    $leadResponse = Invoke-WebRequest -Uri "$API_BASE/leads" -Method POST -Body $leadData -ContentType "application/json"
    
    if ($leadResponse.StatusCode -eq 201) {
        $lead = $leadResponse.Content | ConvertFrom-Json
        Write-Host "✅ Lead created successfully" -ForegroundColor Green
        Write-Host "   Response fields: $($lead.PSObject.Properties.Name -join ', ')"
        Write-Host "   name field: $($lead.name)"
        Write-Host "   email field: $($lead.email)"
    } else {
        Write-Host "❌ Lead creation failed: $($leadResponse.StatusCode)" -ForegroundColor Red
    }

    Write-Host "`n🎉 API endpoint testing completed!" -ForegroundColor Green

} catch {
    Write-Host "💥 Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

