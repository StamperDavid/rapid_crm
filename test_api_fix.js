const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testApiEndpoints() {
  console.log('🧪 Testing API endpoints after field mapping fixes...\n');

  try {
    // Test 1: Create a contact
    console.log('1. Testing contacts POST endpoint...');
    const contactData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-1234',
      companyId: '1'
    };

    const contactResponse = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });

    if (contactResponse.ok) {
      const contact = await contactResponse.json();
      console.log('✅ Contact created successfully');
      console.log('   Response fields:', Object.keys(contact));
      console.log('   firstName field:', contact.firstName);
      console.log('   lastName field:', contact.lastName);
    } else {
      const error = await contactResponse.text();
      console.log('❌ Contact creation failed:', error);
    }

    // Test 2: Create a vehicle
    console.log('\n2. Testing vehicles POST endpoint...');
    const vehicleData = {
      make: 'Ford',
      model: 'F-150',
      year: 2023,
      vin: '1FTFW1ET5DFC12345',
      licensePlate: 'ABC123',
      companyId: '1'
    };

    const vehicleResponse = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData)
    });

    if (vehicleResponse.ok) {
      const vehicle = await vehicleResponse.json();
      console.log('✅ Vehicle created successfully');
      console.log('   Response fields:', Object.keys(vehicle));
      console.log('   make field:', vehicle.make);
      console.log('   licensePlate field:', vehicle.licensePlate);
    } else {
      const error = await vehicleResponse.text();
      console.log('❌ Vehicle creation failed:', error);
    }

    // Test 3: Create a driver
    console.log('\n3. Testing drivers POST endpoint...');
    const driverData = {
      firstName: 'Jane',
      lastName: 'Smith',
      licenseNumber: 'CDL123456',
      phone: '555-5678',
      email: 'jane.smith@example.com',
      companyId: '1'
    };

    const driverResponse = await fetch(`${API_BASE}/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverData)
    });

    if (driverResponse.ok) {
      const driver = await driverResponse.json();
      console.log('✅ Driver created successfully');
      console.log('   Response fields:', Object.keys(driver));
      console.log('   firstName field:', driver.firstName);
      console.log('   licenseNumber field:', driver.licenseNumber);
    } else {
      const error = await driverResponse.text();
      console.log('❌ Driver creation failed:', error);
    }

    // Test 4: Create a deal
    console.log('\n4. Testing deals POST endpoint...');
    const dealData = {
      title: 'Test Deal',
      amount: 5000,
      status: 'qualified',
      companyId: '1'
    };

    const dealResponse = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });

    if (dealResponse.ok) {
      const deal = await dealResponse.json();
      console.log('✅ Deal created successfully');
      console.log('   Response fields:', Object.keys(deal));
      console.log('   title field:', deal.title);
      console.log('   amount field:', deal.amount);
    } else {
      const error = await dealResponse.text();
      console.log('❌ Deal creation failed:', error);
    }

    // Test 5: Create a lead
    console.log('\n5. Testing leads POST endpoint...');
    const leadData = {
      name: 'Test Lead',
      email: 'lead@example.com',
      phone: '555-9999',
      companyId: '1',
      status: 'New'
    };

    const leadResponse = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });

    if (leadResponse.ok) {
      const lead = await leadResponse.json();
      console.log('✅ Lead created successfully');
      console.log('   Response fields:', Object.keys(lead));
      console.log('   name field:', lead.name);
      console.log('   email field:', lead.email);
    } else {
      const error = await leadResponse.text();
      console.log('❌ Lead creation failed:', error);
    }

    console.log('\n🎉 API endpoint testing completed!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testApiEndpoints();

