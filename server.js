const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');
const db = new sqlite3.Database(dbPath);

// Database validation - ensure we're using the correct comprehensive schema
const validateDatabase = () => {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(companies)", (err, columns) => {
      if (err) {
        console.error('❌ Database validation failed:', err);
        reject(err);
        return;
      }
      
      const columnNames = columns.map(col => col.name);
      const hasUsdot = columnNames.includes('usdot_number');
      const hasFleet = columnNames.includes('number_of_vehicles');
      const hasHazmat = columnNames.includes('hazmat_required');
      const hasPhysicalAddress = columnNames.includes('physical_street_address');
      
      if (!hasUsdot || !hasFleet || !hasHazmat || !hasPhysicalAddress) {
        console.error('❌ WRONG DATABASE DETECTED!');
        console.error('This appears to be the simple schema, not the comprehensive transportation schema.');
        console.error('Expected fields: usdot_number, number_of_vehicles, hazmat_required, physical_street_address');
        console.error('Found fields:', columnNames.join(', '));
        console.error('Database path:', dbPath);
        console.error('Please ensure you are using the correct comprehensive transportation database.');
        reject(new Error('Wrong database schema detected'));
        return;
      }
      
      console.log('✅ Database validation passed - using comprehensive transportation schema');
      console.log('✅ Found required fields: usdot_number, number_of_vehicles, hazmat_required, physical_street_address');
      resolve();
    });
  });
};

// Initialize database with schema and seed data (only if needed)
const initDatabase = async () => {
  const fs = require('fs');
  
  try {
    // Check if tables exist first
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      // Create schema only if tables don't exist
      console.log('📄 Creating database schema...');
      const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
      await executeSQLFile(schemaPath, 'Creating database schema');
    } else {
      console.log('✅ Database schema already exists');
    }
    
    // Check if we have data, only populate if empty
    const companies = await runQuery('SELECT COUNT(*) as count FROM companies');
    const hasData = companies[0]?.count > 0;
    
    if (!hasData) {
      console.log('📄 Populating with seed data...');
      const seedDataPath = path.join(__dirname, 'src', 'database', 'seedData.sql');
      await executeSQLFile(seedDataPath, 'Populating with seed data');
    } else {
      console.log(`✅ Database already has ${companies[0].count} companies`);
    }
    
    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('💥 Database initialization failed:', error.message);
    throw error;
  }
};

// Helper function to check if tables exist
const checkTablesExist = async () => {
  try {
    const result = await runQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='companies'
    `);
    return result.length > 0;
  } catch (error) {
    return false;
  }
};

// Helper function to execute SQL file
const executeSQLFile = (filePath, description) => {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`❌ Error reading ${filePath}:`, err);
        reject(err);
        return;
      }

      // Remove comments and normalize whitespace, then split by semicolon
      const cleanData = data
        .split('\n')
        .map(line => {
          // Remove comments (everything after -- on a line)
          const commentIndex = line.indexOf('--');
          if (commentIndex !== -1) {
            line = line.substring(0, commentIndex);
          }
          return line.trim();
        })
        .filter(line => line.length > 0) // Remove empty lines
        .join(' '); // Join all lines with spaces
      
      // Split by semicolon and filter out empty statements
      const statements = cleanData
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      if (statements.length === 0) {
        console.log(`✅ ${description} completed (no statements)`);
        resolve();
        return;
      }

      // Execute statements sequentially to ensure proper order
      let currentIndex = 0;
      let errors = [];
      
      function executeNext() {
        if (currentIndex >= statements.length) {
          if (errors.length > 0) {
            console.error(`❌ ${description} completed with ${errors.length} errors`);
            reject(new Error(`Database initialization failed with ${errors.length} errors`));
          } else {
            console.log(`✅ ${description} completed successfully (${statements.length} statements)`);
            resolve();
          }
          return;
        }
        
        const statement = statements[currentIndex];
        const index = currentIndex;
        currentIndex++;
        
        db.run(statement, (err) => {
          if (err) {
            console.error(`❌ Error in statement ${index + 1}:`, err.message);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
            errors.push({ statement: index + 1, error: err.message, sql: statement });
          }
          
          // Continue with next statement
          executeNext();
        });
      }
      
      // Start executing statements
      executeNext();
    });
  });
};

// Helper function to run queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const runQueryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const runExecute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes, lastID: this.lastID });
      }
    });
  });
};

// API Routes

// Companies
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await runQuery('SELECT * FROM companies');
    // Transform database field names to camelCase for frontend compatibility
    const transformedCompanies = companies.map(company => {
      try {
        return {
          id: company.id || '',
          // Address fields
          physicalStreetAddress: company.physical_street_address || '',
          physicalSuiteApt: company.physical_suite_apt || '',
          physicalCity: company.physical_city || '',
          physicalState: company.physical_state || '',
          physicalCountry: company.physical_country || '',
          physicalZip: company.physical_zip || '',
          isMailingAddressSame: company.is_mailing_address_same || 'No',
          mailingStreetAddress: company.mailing_street_address || '',
          mailingSuiteApt: company.mailing_suite_apt || '',
          mailingCity: company.mailing_city || '',
          mailingState: company.mailing_state || '',
          mailingCountry: company.mailing_country || '',
          mailingZip: company.mailing_zip || '',
          // Business fields
          legalBusinessName: company.legal_business_name || '',
          hasDba: company.has_dba || 'No',
          dbaName: company.dba_name || '',
          businessType: company.business_type || '',
          ein: company.ein || '',
          businessStarted: company.business_started || '',
          classification: company.classification || '',
          operationType: company.operation_type || '',
          interstateIntrastate: company.interstate_intrastate || '',
          usdotNumber: company.usdot_number || '',
          operationClass: company.operation_class || '',
          fleetType: company.fleet_type || '',
          numberOfVehicles: company.number_of_vehicles || 0,
          numberOfDrivers: company.number_of_drivers || 0,
          gvwr: company.gvwr || '',
          vehicleTypes: company.vehicle_types || '',
          cargoTypes: company.cargo_types || '',
          hazmatRequired: company.hazmat_required || 'No',
          phmsaWork: company.phmsa_work || 'No',
          regulatoryDetails: company.regulatory_details || '',
          hasDunsBradstreetNumber: company.has_duns_bradstreet_number || 'No',
          dunsBradstreetNumber: company.duns_bradstreet_number || '',
          createdAt: company.created_at || '',
          updatedAt: company.updated_at || ''
        };
      } catch (transformError) {
        console.error('Error transforming company:', company, transformError);
        throw transformError;
      }
    });
    res.json(transformedCompanies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const {
      physicalStreetAddress, physicalSuiteApt, physicalCity, physicalState, physicalCountry, physicalZip,
      isMailingAddressSame, mailingStreetAddress, mailingSuiteApt, mailingCity, mailingState, mailingCountry, mailingZip,
      legalBusinessName, hasDba, dbaName, businessType, ein, businessStarted,
      classification, operationType, interstateIntrastate, usdotNumber, operationClass,
      fleetType, numberOfVehicles, numberOfDrivers, gvwr, vehicleTypes,
      cargoTypes, hazmatRequired, phmsaWork, regulatoryDetails,
      hasDunsBradstreetNumber, dunsBradstreetNumber
    } = req.body;
    
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      `INSERT INTO companies (
        id, physical_street_address, physical_suite_apt, physical_city, physical_state, 
        physical_country, physical_zip, is_mailing_address_same, mailing_street_address, 
        mailing_suite_apt, mailing_city, mailing_state, mailing_country, mailing_zip, 
        legal_business_name, has_dba, dba_name, business_type, ein, business_started, 
        classification, operation_type, interstate_intrastate, usdot_number, operation_class, 
        fleet_type, number_of_vehicles, number_of_drivers, gvwr, vehicle_types, 
        cargo_types, hazmat_required, phmsa_work, regulatory_details, 
        has_duns_bradstreet_number, duns_bradstreet_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, physicalStreetAddress, physicalSuiteApt, physicalCity, physicalState, physicalCountry, physicalZip,
        isMailingAddressSame, mailingStreetAddress, mailingSuiteApt, mailingCity, mailingState, mailingCountry, mailingZip,
        legalBusinessName, hasDba, dbaName, businessType, ein, businessStarted,
        classification, operationType, interstateIntrastate, usdotNumber, operationClass,
        fleetType, numberOfVehicles, numberOfDrivers, gvwr, vehicleTypes,
        cargoTypes, hazmatRequired, phmsaWork, regulatoryDetails,
        hasDunsBradstreetNumber, dunsBradstreetNumber, now, now
      ]
    );
    
    const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [id]);
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { legalBusinessName, dba, companyType, dotNumber, mcNumber, ein } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE companies SET legal_business_name = ?, dba = ?, company_type = ?, dot_number = ?, mc_number = ?, ein = ?, updated_at = ? WHERE id = ?',
      [legalBusinessName, dba, companyType, dotNumber, mcNumber, ein, now, req.params.id]
    );
    
    const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM companies WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await runQuery('SELECT * FROM contacts');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await runQueryOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO contacts (id, first_name, last_name, email, phone, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, firstName, lastName, email, phone, companyId, now, now]
    );
    
    const contact = await runQueryOne('SELECT * FROM contacts WHERE id = ?', [id]);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [firstName, lastName, email, phone, companyId, now, req.params.id]
    );
    
    const contact = await runQueryOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await runQuery('SELECT * FROM vehicles');
    
    // Map database fields to frontend camelCase format
    const mappedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      companyId: vehicle.company_id,
      vin: vehicle.vin,
      licensePlate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehicleType: vehicle.vehicle_type,
      gvwr: vehicle.gvwr,
      emptyWeight: vehicle.empty_weight,
      fuelType: vehicle.fuel_type,
      registrationNumber: vehicle.registration_number,
      registrationExpiry: vehicle.registration_expiry,
      insuranceProvider: vehicle.insurance_provider,
      insurancePolicyNumber: vehicle.insurance_policy_number,
      insuranceExpiry: vehicle.insurance_expiry,
      lastInspectionDate: vehicle.last_inspection_date,
      nextInspectionDue: vehicle.next_inspection_due,
      lastMaintenanceDate: vehicle.last_maintenance_date,
      nextMaintenanceDue: vehicle.next_maintenance_due,
      hasHazmatEndorsement: vehicle.has_hazmat_endorsement,
      status: vehicle.status,
      currentDriverId: vehicle.current_driver_id,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at
    }));
    
    res.json(mappedVehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Map database fields to frontend camelCase format
    const mappedVehicle = {
      id: vehicle.id,
      companyId: vehicle.company_id,
      vin: vehicle.vin,
      licensePlate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehicleType: vehicle.vehicle_type,
      gvwr: vehicle.gvwr,
      emptyWeight: vehicle.empty_weight,
      fuelType: vehicle.fuel_type,
      registrationNumber: vehicle.registration_number,
      registrationExpiry: vehicle.registration_expiry,
      insuranceProvider: vehicle.insurance_provider,
      insurancePolicyNumber: vehicle.insurance_policy_number,
      insuranceExpiry: vehicle.insurance_expiry,
      lastInspectionDate: vehicle.last_inspection_date,
      nextInspectionDue: vehicle.next_inspection_due,
      lastMaintenanceDate: vehicle.last_maintenance_date,
      nextMaintenanceDue: vehicle.next_maintenance_due,
      hasHazmatEndorsement: vehicle.has_hazmat_endorsement,
      status: vehicle.status,
      currentDriverId: vehicle.current_driver_id,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at
    };
    
    res.json(mappedVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { make, model, year, vin, licensePlate, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO vehicles (id, make, model, year, vin, license_plate, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, make, model, year, vin, licensePlate, companyId, now, now]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { make, model, year, vin, licensePlate, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE vehicles SET make = ?, model = ?, year = ?, vin = ?, license_plate = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [make, model, year, vin, licensePlate, companyId, now, req.params.id]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await runQuery('SELECT * FROM drivers');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const { firstName, lastName, licenseNumber, phone, email, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO drivers (id, first_name, last_name, license_number, phone, email, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, firstName, lastName, licenseNumber, phone, email, companyId, now, now]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [id]);
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const { firstName, lastName, licenseNumber, phone, email, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE drivers SET first_name = ?, last_name = ?, license_number = ?, phone = ?, email = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [firstName, lastName, licenseNumber, phone, email, companyId, now, req.params.id]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM drivers WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deals
app.get('/api/deals', async (req, res) => {
  try {
    const deals = await runQuery('SELECT * FROM deals');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/deals/:id', async (req, res) => {
  try {
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [req.params.id]);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deals', async (req, res) => {
  try {
    const { title, amount, status, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO deals (id, title, amount, status, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, amount, status, companyId, now, now]
    );
    
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [id]);
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/deals/:id', async (req, res) => {
  try {
    const { title, amount, status, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE deals SET title = ?, amount = ?, status = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [title, amount, status, companyId, now, req.params.id]
    );
    
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [req.params.id]);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/deals/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM deals WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Services API endpoints
app.get('/api/services', async (req, res) => {
  try {
    const services = await runQuery('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await runQueryOne('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, description, category, basePrice, estimatedDuration, requirements, deliverables, isActive } = req.body;
    
    const result = await runExecute(`
      INSERT INTO services (name, description, category, base_price, estimated_duration, requirements, deliverables, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [name, description, category, basePrice, estimatedDuration, JSON.stringify(requirements), JSON.stringify(deliverables), isActive]);
    
    const newService = await runQueryOne('SELECT * FROM services WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { name, description, category, basePrice, estimatedDuration, requirements, deliverables, isActive } = req.body;
    
    await runExecute(`
      UPDATE services 
      SET name = ?, description = ?, category = ?, base_price = ?, estimated_duration = ?, 
          requirements = ?, deliverables = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [name, description, category, basePrice, estimatedDuration, JSON.stringify(requirements), JSON.stringify(deliverables), isActive, req.params.id]);
    
    const updatedService = await runQueryOne('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await runQuery('SELECT * FROM invoices');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await runQueryOne('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { invoiceNumber, amount, status, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO invoices (id, invoice_number, amount, status, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, invoiceNumber, amount, status, companyId, now, now]
    );
    
    const invoice = await runQueryOne('SELECT * FROM invoices WHERE id = ?', [id]);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { invoiceNumber, amount, status, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE invoices SET invoice_number = ?, amount = ?, status = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [invoiceNumber, amount, status, companyId, now, req.params.id]
    );
    
    const invoice = await runQueryOne('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await runQuery('SELECT * FROM leads');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    const lead = await runQueryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, companyId, status } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO leads (id, name, email, phone, company_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, companyId, status, now, now]
    );
    
    const lead = await runQueryOne('SELECT * FROM leads WHERE id = ?', [id]);
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { name, email, phone, companyId, status } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE leads SET name = ?, email = ?, phone = ?, company_id = ?, status = ?, updated_at = ? WHERE id = ?',
      [name, email, phone, companyId, status, now, req.params.id]
    );
    
    const lead = await runQueryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await runQuery('SELECT * FROM campaigns');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const campaign = await runQueryOne('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO campaigns (id, name, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description, status, now, now]
    );
    
    const campaign = await runQueryOne('SELECT * FROM campaigns WHERE id = ?', [id]);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/campaigns/:id', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE campaigns SET name = ?, description = ?, status = ?, updated_at = ? WHERE id = ?',
      [name, description, status, now, req.params.id]
    );
    
    const campaign = await runQueryOne('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM campaigns WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicles - Duplicate endpoints removed

app.post('/api/vehicles', async (req, res) => {
  try {
    const {
      companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
      registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
      lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
      status, currentDriverId
    } = req.body;
    
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      `INSERT INTO vehicles (
        id, company_id, vin, license_plate, make, model, year, color, vehicle_type, gvwr, empty_weight, fuel_type,
        registration_number, registration_expiry, insurance_provider, insurance_policy_number, insurance_expiry,
        last_inspection_date, next_inspection_due, last_maintenance_date, next_maintenance_due, has_hazmat_endorsement,
        status, current_driver_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
        registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
        lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
        status, currentDriverId, now, now
      ]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const {
      companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
      registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
      lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
      status, currentDriverId
    } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      `UPDATE vehicles SET 
        company_id = ?, vin = ?, license_plate = ?, make = ?, model = ?, year = ?, color = ?, vehicle_type = ?, gvwr = ?, empty_weight = ?, fuel_type = ?,
        registration_number = ?, registration_expiry = ?, insurance_provider = ?, insurance_policy_number = ?, insurance_expiry = ?,
        last_inspection_date = ?, next_inspection_due = ?, last_maintenance_date = ?, next_maintenance_due = ?, has_hazmat_endorsement = ?,
        status = ?, current_driver_id = ?, updated_at = ? WHERE id = ?`,
      [
        companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
        registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
        lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
        status, currentDriverId, now, req.params.id
      ]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await runQuery('SELECT * FROM drivers');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const {
      companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
      medicalCardExpiry, hireDate, employmentStatus, position, payType
    } = req.body;
    
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      `INSERT INTO drivers (
        id, company_id, driver_name, first_name, last_name, phone, email, license_number, license_class, license_expiry,
        medical_card_expiry, hire_date, employment_status, position, pay_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
        medicalCardExpiry, hireDate, employmentStatus, position, payType, now, now
      ]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [id]);
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const {
      companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
      medicalCardExpiry, hireDate, employmentStatus, position, payType
    } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      `UPDATE drivers SET 
        company_id = ?, driver_name = ?, first_name = ?, last_name = ?, phone = ?, email = ?, license_number = ?, license_class = ?, license_expiry = ?,
        medical_card_expiry = ?, hire_date = ?, employment_status = ?, position = ?, pay_type = ?, updated_at = ? WHERE id = ?`,
      [
        companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
        medicalCardExpiry, hireDate, employmentStatus, position, payType, now, req.params.id
      ]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM drivers WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Keys
app.get('/api/api-keys', async (req, res) => {
  try {
    const apiKeys = await runQuery('SELECT * FROM api_keys');
    res.json(apiKeys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/api-keys/:id', async (req, res) => {
  try {
    const apiKey = await runQueryOne('SELECT * FROM api_keys WHERE id = ?', [req.params.id]);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }
    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/api-keys', async (req, res) => {
  try {
    const { name, keyValue, provider } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO api_keys (id, name, key_value, provider, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, keyValue, provider, now, now]
    );
    
    const apiKey = await runQueryOne('SELECT * FROM api_keys WHERE id = ?', [id]);
    res.status(201).json(apiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/api-keys/:id', async (req, res) => {
  try {
    const { name, keyValue, provider } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE api_keys SET name = ?, key_value = ?, provider = ?, updated_at = ? WHERE id = ?',
      [name, keyValue, provider, now, req.params.id]
    );
    
    const apiKey = await runQueryOne('SELECT * FROM api_keys WHERE id = ?', [req.params.id]);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }
    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/api-keys/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM api_keys WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if database exists and has data, if not initialize it
const checkAndInitializeDatabase = async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Initialize database and start server
validateDatabase()
  .then(() => checkAndInitializeDatabase())
  .then(() => {
    console.log('✅ Database ready');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to validate or initialize database:', error);
    process.exit(1);
  });
