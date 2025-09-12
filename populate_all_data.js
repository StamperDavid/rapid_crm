const API_BASE = 'http://localhost:3001/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error.message);
    return null;
  }
}

// Test data for all entities
const testData = {
  companies: [
    {
      physicalStreetAddress: '1234 Main Street',
      physicalSuiteApt: 'Suite 200',
      physicalCity: 'Dallas',
      physicalState: 'TX',
      physicalCountry: 'United States',
      physicalZip: '75201',
      isMailingAddressSame: 'No',
      mailingStreetAddress: '5678 Business Blvd',
      mailingSuiteApt: 'Floor 5',
      mailingCity: 'Dallas',
      mailingState: 'TX',
      mailingCountry: 'United States',
      mailingZip: '75202',
      legalBusinessName: 'Texas Transport Solutions LLC',
      hasDBA: 'Yes',
      dbaName: 'TTS Logistics',
      businessType: 'LLC',
      ein: '12-3456789',
      businessStarted: '2020-03-15',
      classification: 'Carrier',
      operationType: 'Long-Haul',
      interstateIntrastate: 'Interstate',
      usdotNumber: 'TX123456',
      operationClass: 'Class A',
      fleetType: 'Owned',
      numberOfVehicles: 25,
      numberOfDrivers: 30,
      gvwr: '80,000 lbs',
      vehicleTypes: 'Trucks,Trailers,Flatbeds',
      cargoTypes: 'General Freight,Hazardous Materials,Automobiles',
      hazmatRequired: 'Yes',
      phmsaWork: 'Yes',
      regulatoryDetails: ['IFTA', 'IRP', 'UCR', 'BOC-3'],
      hasDunsBradstreetNumber: 'Yes',
      dunsBradstreetNumber: '123456789'
    },
    {
      physicalStreetAddress: '9876 Industrial Way',
      physicalSuiteApt: 'Building A',
      physicalCity: 'Houston',
      physicalState: 'TX',
      physicalCountry: 'United States',
      physicalZip: '77001',
      isMailingAddressSame: 'Yes',
      mailingStreetAddress: '',
      mailingSuiteApt: '',
      mailingCity: '',
      mailingState: '',
      mailingCountry: '',
      mailingZip: '',
      legalBusinessName: 'Gulf Coast Freight Forwarders Inc',
      hasDBA: 'No',
      dbaName: '',
      businessType: 'Corporation',
      ein: '98-7654321',
      businessStarted: '2018-07-22',
      classification: 'Freight Forwarder',
      operationType: 'Short-Haul',
      interstateIntrastate: 'Intrastate',
      usdotNumber: 'TX789012',
      operationClass: 'Class B',
      fleetType: 'Leased',
      numberOfVehicles: 12,
      numberOfDrivers: 15,
      gvwr: '26,000 lbs',
      vehicleTypes: 'Box Trucks,Refrigerated',
      cargoTypes: 'Refrigerated Food,General Freight',
      hazmatRequired: 'No',
      phmsaWork: 'No',
      regulatoryDetails: ['IFTA', 'UCR'],
      hasDunsBradstreetNumber: 'No',
      dunsBradstreetNumber: ''
    },
    {
      physicalStreetAddress: '5555 Logistics Lane',
      physicalSuiteApt: 'Unit 100',
      physicalCity: 'Austin',
      physicalState: 'TX',
      physicalCountry: 'United States',
      physicalZip: '73301',
      isMailingAddressSame: 'No',
      mailingStreetAddress: '7777 Corporate Center',
      mailingSuiteApt: 'Suite 1500',
      mailingCity: 'Austin',
      mailingState: 'TX',
      mailingCountry: 'United States',
      mailingZip: '73302',
      legalBusinessName: 'Central Texas Brokerage Partners',
      hasDBA: 'Yes',
      dbaName: 'CTX Brokerage',
      businessType: 'Partnership',
      ein: '45-6789012',
      businessStarted: '2019-11-08',
      classification: 'Broker',
      operationType: 'Local Delivery',
      interstateIntrastate: 'Interstate',
      usdotNumber: 'TX345678',
      operationClass: 'Class C',
      fleetType: 'Mixed',
      numberOfVehicles: 8,
      numberOfDrivers: 10,
      gvwr: '33,000 lbs',
      vehicleTypes: 'Vans,Box Trucks',
      cargoTypes: 'Household Goods,General Freight',
      hazmatRequired: 'No',
      phmsaWork: 'No',
      regulatoryDetails: ['UCR', 'BOC-3'],
      hasDunsBradstreetNumber: 'Yes',
      dunsBradstreetNumber: '987654321'
    },
    {
      physicalStreetAddress: '9999 Specialized Transport Drive',
      physicalSuiteApt: 'Warehouse 3',
      physicalCity: 'San Antonio',
      physicalState: 'TX',
      physicalCountry: 'United States',
      physicalZip: '78201',
      isMailingAddressSame: 'Yes',
      mailingStreetAddress: '',
      mailingSuiteApt: '',
      mailingCity: '',
      mailingState: '',
      mailingCountry: '',
      mailingZip: '',
      legalBusinessName: 'Alamo Heavy Haul Specialists',
      hasDBA: 'No',
      dbaName: '',
      businessType: 'Sole Proprietorship',
      ein: '78-9012345',
      businessStarted: '2021-01-12',
      classification: 'Carrier',
      operationType: 'Specialized Transport',
      interstateIntrastate: 'Interstate',
      usdotNumber: 'TX901234',
      operationClass: 'Class A',
      fleetType: 'Owned',
      numberOfVehicles: 6,
      numberOfDrivers: 8,
      gvwr: '120,000 lbs',
      vehicleTypes: 'Heavy Haul,Lowboys,Flatbeds',
      cargoTypes: 'Machinery,Construction Equipment,Heavy Machinery',
      hazmatRequired: 'Yes',
      phmsaWork: 'No',
      regulatoryDetails: ['IFTA', 'IRP', 'UCR', 'BOC-3', 'Oversize Permits'],
      hasDunsBradstreetNumber: 'Yes',
      dunsBradstreetNumber: '456789123'
    }
  ],

  contacts: [
    { firstName: 'John', lastName: 'Smith', phone: '555-0101', email: 'john.smith@ttslogistics.com', preferredContactMethod: 'Email', isPrimaryContact: true, position: 'Operations Manager', department: 'Operations', companyId: '' },
    { firstName: 'Sarah', lastName: 'Johnson', phone: '555-0102', email: 'sarah.johnson@gcff.com', preferredContactMethod: 'Phone', isPrimaryContact: true, position: 'CEO', department: 'Executive', companyId: '' },
    { firstName: 'Mike', lastName: 'Davis', phone: '555-0103', email: 'mike.davis@ctxbrokerage.com', preferredContactMethod: 'Text', isPrimaryContact: true, position: 'Sales Director', department: 'Sales', companyId: '' },
    { firstName: 'Lisa', lastName: 'Wilson', phone: '555-0104', email: 'lisa.wilson@alamohaul.com', preferredContactMethod: 'Email', isPrimaryContact: true, position: 'Fleet Manager', department: 'Operations', companyId: '' },
    { firstName: 'Robert', lastName: 'Brown', phone: '555-0105', email: 'robert.brown@ttslogistics.com', preferredContactMethod: 'Phone', isPrimaryContact: false, position: 'Safety Coordinator', department: 'Safety', companyId: '' },
    { firstName: 'Jennifer', lastName: 'Garcia', phone: '555-0106', email: 'jennifer.garcia@gcff.com', preferredContactMethod: 'Email', isPrimaryContact: false, position: 'Compliance Officer', department: 'Compliance', companyId: '' }
  ],

  leads: [
    { firstName: 'David', lastName: 'Miller', email: 'david.miller@newtransport.com', phone: '555-0201', company: 'New Transport Solutions', leadSource: 'Website', leadStatus: 'New', leadScore: 85, assignedTo: 'John Smith', nextFollowUpDate: '2024-01-15', notes: 'Interested in hazmat certification services', companyId: '' },
    { firstName: 'Amanda', lastName: 'Taylor', email: 'amanda.taylor@logisticsplus.com', phone: '555-0202', company: 'Logistics Plus Inc', leadSource: 'Referral', leadStatus: 'Qualified', leadScore: 92, assignedTo: 'Sarah Johnson', nextFollowUpDate: '2024-01-18', notes: 'Looking for freight forwarding services', companyId: '' },
    { firstName: 'Chris', lastName: 'Anderson', email: 'chris.anderson@heavyhaul.com', phone: '555-0203', company: 'Heavy Haul Specialists', leadSource: 'Trade Show', leadStatus: 'Contacted', leadScore: 78, assignedTo: 'Mike Davis', nextFollowUpDate: '2024-01-20', notes: 'Needs oversize permit assistance', companyId: '' },
    { firstName: 'Michelle', lastName: 'Thomas', email: 'michelle.thomas@fleetmgmt.com', phone: '555-0204', company: 'Fleet Management Co', leadSource: 'Cold Call', leadStatus: 'New', leadScore: 65, assignedTo: 'Lisa Wilson', nextFollowUpDate: '2024-01-22', notes: 'Interested in fleet compliance services', companyId: '' }
  ],

  deals: [
    { title: 'Hazmat Certification Package', value: 2500, stage: 'Proposal', probability: 75, expectedCloseDate: '2024-02-15', notes: 'Full hazmat certification and training package', companyId: '' },
    { title: 'Freight Forwarding Setup', value: 1800, stage: 'Negotiation', probability: 60, expectedCloseDate: '2024-02-20', notes: 'Complete freight forwarding setup and compliance', companyId: '' },
    { title: 'Oversize Permit Service', value: 1200, stage: 'Qualified', probability: 85, expectedCloseDate: '2024-02-10', notes: 'Oversize permit application and management', companyId: '' },
    { title: 'Fleet Compliance Audit', value: 3200, stage: 'Closed Won', probability: 100, expectedCloseDate: '2024-01-30', notes: 'Complete fleet compliance audit and recommendations', companyId: '' }
  ],

  services: [
    { name: 'USDOT Registration', description: 'Complete USDOT number registration and MCS-150 filing', category: 'Registration', basePrice: 299, isActive: true },
    { name: 'Hazmat Certification', description: 'Hazmat endorsement and certification training', category: 'Training', basePrice: 450, isActive: true },
    { name: 'IFTA Registration', description: 'International Fuel Tax Agreement registration', category: 'Compliance', basePrice: 199, isActive: true },
    { name: 'IRP Registration', description: 'International Registration Plan registration', category: 'Compliance', basePrice: 299, isActive: true },
    { name: 'UCR Registration', description: 'Unified Carrier Registration', category: 'Compliance', basePrice: 76, isActive: true },
    { name: 'BOC-3 Filing', description: 'Process Agent designation filing', category: 'Compliance', basePrice: 150, isActive: true },
    { name: 'Oversize Permits', description: 'Oversize/overweight permit applications', category: 'Compliance', basePrice: 250, isActive: true },
    { name: 'Fleet Compliance Audit', description: 'Complete fleet compliance review and recommendations', category: 'Support', basePrice: 800, isActive: true }
  ],

  vehicles: [
    { year: 2022, make: 'Peterbilt', model: '579', vin: '1NP5DB0X9NN123456', licensePlate: 'TX-ABC123', vehicleType: 'Tractor', companyId: '' },
    { year: 2021, make: 'Freightliner', model: 'Cascadia', vin: '1FUJGBDV8MLB234567', licensePlate: 'TX-DEF456', vehicleType: 'Tractor', companyId: '' },
    { year: 2023, make: 'Volvo', model: 'VNL', vin: '4V4NC9GH5NN345678', licensePlate: 'TX-GHI789', vehicleType: 'Tractor', companyId: '' },
    { year: 2020, make: 'Great Dane', model: 'Reefer', vin: '1GRAA0620LM456789', licensePlate: 'TX-JKL012', vehicleType: 'Trailer', companyId: '' },
    { year: 2022, make: 'Wabash', model: 'National', vin: '1JJV532D2NL567890', licensePlate: 'TX-MNO345', vehicleType: 'Trailer', companyId: '' },
    { year: 2021, make: 'Utility', model: 'Flatbed', vin: '1UYVS2530ML678901', licensePlate: 'TX-PQR678', vehicleType: 'Trailer', companyId: '' }
  ],

  drivers: [
    { firstName: 'James', lastName: 'Rodriguez', licenseNumber: 'D123456789', licenseClass: 'Class A', cdlEndorsements: 'Hazmat,Tanker', phone: '555-0301', email: 'james.rodriguez@driver.com', companyId: '' },
    { firstName: 'Maria', lastName: 'Gonzalez', licenseNumber: 'D234567890', licenseClass: 'Class A', cdlEndorsements: 'Passenger', phone: '555-0302', email: 'maria.gonzalez@driver.com', companyId: '' },
    { firstName: 'William', lastName: 'Thompson', licenseNumber: 'D345678901', licenseClass: 'Class B', cdlEndorsements: 'Tanker', phone: '555-0303', email: 'william.thompson@driver.com', companyId: '' },
    { firstName: 'Patricia', lastName: 'Martinez', licenseNumber: 'D456789012', licenseClass: 'Class A', cdlEndorsements: 'Hazmat,Double/Triple', phone: '555-0304', email: 'patricia.martinez@driver.com', companyId: '' },
    { firstName: 'Michael', lastName: 'Lee', licenseNumber: 'D567890123', licenseClass: 'Class A', cdlEndorsements: 'Oversize', phone: '555-0305', email: 'michael.lee@driver.com', companyId: '' },
    { firstName: 'Jennifer', lastName: 'White', licenseNumber: 'D678901234', licenseClass: 'Class B', cdlEndorsements: 'Passenger', phone: '555-0306', email: 'jennifer.white@driver.com', companyId: '' }
  ],

  invoices: [
    { invoiceNumber: 'INV-2024-001', clientName: 'Texas Transport Solutions LLC', amount: 2500, status: 'Paid', dueDate: '2024-01-15', description: 'Hazmat Certification Package', companyId: '' },
    { invoiceNumber: 'INV-2024-002', clientName: 'Gulf Coast Freight Forwarders Inc', amount: 1800, status: 'Pending', dueDate: '2024-02-01', description: 'Freight Forwarding Setup', companyId: '' },
    { invoiceNumber: 'INV-2024-003', clientName: 'Central Texas Brokerage Partners', amount: 1200, status: 'Overdue', dueDate: '2024-01-10', description: 'Oversize Permit Service', companyId: '' },
    { invoiceNumber: 'INV-2024-004', clientName: 'Alamo Heavy Haul Specialists', amount: 3200, status: 'Paid', dueDate: '2024-01-30', description: 'Fleet Compliance Audit', companyId: '' }
  ]
};

async function populateAllData() {
  try {
    console.log('🚀 Starting comprehensive database population...');
    
    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test server connection
    try {
      const healthCheck = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
      if (!healthCheck.ok) {
        throw new Error('Server not responding');
      }
      console.log('✅ Server is ready');
    } catch (error) {
      console.error('❌ Server not ready:', error.message);
      return;
    }
    
    const createdEntities = { companies: [], contacts: [], leads: [], deals: [], services: [], vehicles: [], drivers: [], invoices: [] };
    
    // 1. Create Companies
    console.log('\n📊 Creating companies...');
    for (const companyData of testData.companies) {
      const company = await apiCall('/companies', 'POST', companyData);
      if (company) {
        createdEntities.companies.push(company);
        console.log(`✅ Created company: ${company.legalBusinessName} (${company.usdotNumber})`);
      }
    }
    
    // 2. Create Services (independent of companies)
    console.log('\n🛠️ Creating services...');
    for (const serviceData of testData.services) {
      const service = await apiCall('/services', 'POST', serviceData);
      if (service) {
        createdEntities.services.push(service);
        console.log(`✅ Created service: ${service.name}`);
      }
    }
    
    // 3. Create Contacts (linked to companies)
    console.log('\n👥 Creating contacts...');
    for (let i = 0; i < testData.contacts.length; i++) {
      const contactData = { ...testData.contacts[i] };
      contactData.companyId = createdEntities.companies[i % createdEntities.companies.length].id;
      
      const contact = await apiCall('/contacts', 'POST', contactData);
      if (contact) {
        createdEntities.contacts.push(contact);
        console.log(`✅ Created contact: ${contact.firstName} ${contact.lastName}`);
      }
    }
    
    // 4. Create Leads (linked to companies)
    console.log('\n🎯 Creating leads...');
    for (let i = 0; i < testData.leads.length; i++) {
      const leadData = { ...testData.leads[i] };
      leadData.companyId = createdEntities.companies[i % createdEntities.companies.length].id;
      
      const lead = await apiCall('/leads', 'POST', leadData);
      if (lead) {
        createdEntities.leads.push(lead);
        console.log(`✅ Created lead: ${lead.firstName} ${lead.lastName} - ${lead.company}`);
      }
    }
    
    // 5. Create Deals (linked to companies)
    console.log('\n💰 Creating deals...');
    for (let i = 0; i < testData.deals.length; i++) {
      const dealData = { ...testData.deals[i] };
      dealData.companyId = createdEntities.companies[i % createdEntities.companies.length].id;
      
      const deal = await apiCall('/deals', 'POST', dealData);
      if (deal) {
        createdEntities.deals.push(deal);
        console.log(`✅ Created deal: ${deal.title} - $${deal.value}`);
      }
    }
    
    // 6. Create Vehicles (linked to companies)
    console.log('\n🚛 Creating vehicles...');
    for (let i = 0; i < testData.vehicles.length; i++) {
      const vehicleData = { ...testData.vehicles[i] };
      vehicleData.companyId = createdEntities.companies[i % createdEntities.companies.length].id;
      
      const vehicle = await apiCall('/vehicles', 'POST', vehicleData);
      if (vehicle) {
        createdEntities.vehicles.push(vehicle);
        console.log(`✅ Created vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      }
    }
    
    // 7. Create Drivers (linked to companies)
    console.log('\n👨‍💼 Creating drivers...');
    for (let i = 0; i < testData.drivers.length; i++) {
      const driverData = { ...testData.drivers[i] };
      driverData.companyId = createdEntities.companies[i % createdEntities.companies.length].id;
      
      const driver = await apiCall('/drivers', 'POST', driverData);
      if (driver) {
        createdEntities.drivers.push(driver);
        console.log(`✅ Created driver: ${driver.firstName} ${driver.lastName} - CDL: ${driver.licenseNumber}`);
      }
    }
    
    // 8. Create Invoices (linked to companies)
    console.log('\n🧾 Creating invoices...');
    for (let i = 0; i < testData.invoices.length; i++) {
      const invoiceData = { ...testData.invoices[i] };
      invoiceData.companyId = createdEntities.companies[i % createdEntities.companies.length].id;
      
      const invoice = await apiCall('/invoices', 'POST', invoiceData);
      if (invoice) {
        createdEntities.invoices.push(invoice);
        console.log(`✅ Created invoice: ${invoice.invoiceNumber} - $${invoice.amount}`);
      }
    }
    
    // Summary
    console.log('\n🎉 Database population completed successfully!');
    console.log('\n📊 Summary of created data:');
    console.log(`   Companies: ${createdEntities.companies.length}`);
    console.log(`   Contacts: ${createdEntities.contacts.length}`);
    console.log(`   Leads: ${createdEntities.leads.length}`);
    console.log(`   Deals: ${createdEntities.deals.length}`);
    console.log(`   Services: ${createdEntities.services.length}`);
    console.log(`   Vehicles: ${createdEntities.vehicles.length}`);
    console.log(`   Drivers: ${createdEntities.drivers.length}`);
    console.log(`   Invoices: ${createdEntities.invoices.length}`);
    
    console.log('\n🌐 Check your frontend:');
    console.log('   Companies: http://localhost:3000/companies');
    console.log('   Leads: http://localhost:3000/leads');
    console.log('   Services: http://localhost:3000/services');
    
  } catch (error) {
    console.error('❌ Error in populateAllData:', error);
  }
}

// Run the script
populateAllData();

