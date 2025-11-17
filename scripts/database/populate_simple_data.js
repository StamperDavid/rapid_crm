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
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error.message);
    return null;
  }
}

async function populateSimpleData() {
  try {
    console.log('🚀 Starting simple database population...');
    
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
    
    // First, let's see what companies already exist
    console.log('\n📊 Checking existing companies...');
    const existingCompanies = await apiCall('/companies');
    console.log(`Found ${existingCompanies ? existingCompanies.length : 0} existing companies`);
    
    if (existingCompanies && existingCompanies.length > 0) {
      console.log('Using existing companies for relationships...');
      
      // Create simple contacts using existing companies
      console.log('\n👥 Creating contacts...');
      const contactData = [
        { firstName: 'John', lastName: 'Smith', email: 'john.smith@company.com', phone: '555-0101', companyId: existingCompanies[0].id },
        { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@company.com', phone: '555-0102', companyId: existingCompanies[0].id },
        { firstName: 'Mike', lastName: 'Davis', email: 'mike.davis@company.com', phone: '555-0103', companyId: existingCompanies[1] ? existingCompanies[1].id : existingCompanies[0].id }
      ];
      
      for (const contact of contactData) {
        const createdContact = await apiCall('/contacts', 'POST', contact);
        if (createdContact) {
          console.log(`✅ Created contact: ${contact.firstName} ${contact.lastName}`);
        }
      }
      
      // Create simple services
      console.log('\n🛠️ Creating services...');
      const serviceData = [
        { name: 'USDOT Registration', description: 'Complete USDOT number registration', category: 'Registration', basePrice: 299, isActive: true },
        { name: 'Hazmat Certification', description: 'Hazmat endorsement training', category: 'Training', basePrice: 450, isActive: true },
        { name: 'IFTA Registration', description: 'International Fuel Tax Agreement', category: 'Compliance', basePrice: 199, isActive: true }
      ];
      
      for (const service of serviceData) {
        const createdService = await apiCall('/services', 'POST', service);
        if (createdService) {
          console.log(`✅ Created service: ${service.name}`);
        }
      }
      
      // Create simple leads
      console.log('\n🎯 Creating leads...');
      const leadData = [
        { firstName: 'David', lastName: 'Miller', email: 'david.miller@newtransport.com', phone: '555-0201', company: 'New Transport Solutions', leadSource: 'Website', leadStatus: 'New', leadScore: 85, assignedTo: 'John Smith', nextFollowUpDate: '2024-01-15', notes: 'Interested in hazmat services', companyId: existingCompanies[0].id },
        { firstName: 'Amanda', lastName: 'Taylor', email: 'amanda.taylor@logistics.com', phone: '555-0202', company: 'Logistics Plus Inc', leadSource: 'Referral', leadStatus: 'Qualified', leadScore: 92, assignedTo: 'Maria Garcia', nextFollowUpDate: '2024-01-18', notes: 'Looking for freight forwarding', companyId: existingCompanies[1] ? existingCompanies[1].id : existingCompanies[0].id }
      ];
      
      for (const lead of leadData) {
        const createdLead = await apiCall('/leads', 'POST', lead);
        if (createdLead) {
          console.log(`✅ Created lead: ${lead.firstName} ${lead.lastName} - ${lead.company}`);
        }
      }
      
      // Create simple deals
      console.log('\n💰 Creating deals...');
      const dealData = [
        { title: 'Hazmat Certification Package', value: 2500, stage: 'Proposal', probability: 75, expectedCloseDate: '2024-02-15', notes: 'Full hazmat certification package', companyId: existingCompanies[0].id },
        { title: 'Freight Forwarding Setup', value: 1800, stage: 'Negotiation', probability: 60, expectedCloseDate: '2024-02-20', notes: 'Complete freight forwarding setup', companyId: existingCompanies[1] ? existingCompanies[1].id : existingCompanies[0].id }
      ];
      
      for (const deal of dealData) {
        const createdDeal = await apiCall('/deals', 'POST', deal);
        if (createdDeal) {
          console.log(`✅ Created deal: ${deal.title} - $${deal.value}`);
        }
      }
      
      // Create simple vehicles
      console.log('\n🚛 Creating vehicles...');
      const vehicleData = [
        { year: 2022, make: 'Peterbilt', model: '579', vin: '1NP5DB0X9NN123456', licensePlate: 'TX-ABC123', vehicleType: 'Tractor', companyId: existingCompanies[0].id },
        { year: 2021, make: 'Freightliner', model: 'Cascadia', vin: '1FUJGBDV8MLB234567', licensePlate: 'TX-DEF456', vehicleType: 'Tractor', companyId: existingCompanies[1] ? existingCompanies[1].id : existingCompanies[0].id }
      ];
      
      for (const vehicle of vehicleData) {
        const createdVehicle = await apiCall('/vehicles', 'POST', vehicle);
        if (createdVehicle) {
          console.log(`✅ Created vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
        }
      }
      
      // Create simple drivers
      console.log('\n👨‍💼 Creating drivers...');
      const driverData = [
        { firstName: 'James', lastName: 'Rodriguez', licenseNumber: 'D123456789', licenseClass: 'Class A', phone: '555-0301', email: 'james.rodriguez@driver.com', companyId: existingCompanies[0].id },
        { firstName: 'Maria', lastName: 'Gonzalez', licenseNumber: 'D234567890', licenseClass: 'Class A', phone: '555-0302', email: 'maria.gonzalez@driver.com', companyId: existingCompanies[1] ? existingCompanies[1].id : existingCompanies[0].id }
      ];
      
      for (const driver of driverData) {
        const createdDriver = await apiCall('/drivers', 'POST', driver);
        if (createdDriver) {
          console.log(`✅ Created driver: ${driver.firstName} ${driver.lastName} - CDL: ${driver.licenseNumber}`);
        }
      }
      
      // Create simple invoices
      console.log('\n🧾 Creating invoices...');
      const invoiceData = [
        { invoiceNumber: 'INV-2024-001', clientName: existingCompanies[0].legalBusinessName, amount: 2500, status: 'Paid', dueDate: '2024-01-15', description: 'Hazmat Certification Package', companyId: existingCompanies[0].id },
        { invoiceNumber: 'INV-2024-002', clientName: existingCompanies[1] ? existingCompanies[1].legalBusinessName : existingCompanies[0].legalBusinessName, amount: 1800, status: 'Pending', dueDate: '2024-02-01', description: 'Freight Forwarding Setup', companyId: existingCompanies[1] ? existingCompanies[1].id : existingCompanies[0].id }
      ];
      
      for (const invoice of invoiceData) {
        const createdInvoice = await apiCall('/invoices', 'POST', invoice);
        if (createdInvoice) {
          console.log(`✅ Created invoice: ${invoice.invoiceNumber} - $${invoice.amount}`);
        }
      }
      
    } else {
      console.log('❌ No existing companies found. Please create companies first.');
    }
    
    console.log('\n🎉 Simple database population completed!');
    console.log('\n🌐 Check your frontend:');
    console.log('   Companies: http://localhost:3000/companies');
    console.log('   Leads: http://localhost:3000/leads');
    console.log('   Services: http://localhost:3000/services');
    
  } catch (error) {
    console.error('❌ Error in populateSimpleData:', error);
  }
}

// Run the script
populateSimpleData();

