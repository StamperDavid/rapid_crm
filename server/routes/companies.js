/**
 * Companies Routes Module
 *
 * Handles all company-related API endpoints.
 * Extracted from the monolithic server.js for better maintainability.
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/async-handler');
const { validateCompanyData } = require('../middleware/validation');

// Transform company data for frontend consumption
function transformCompany(company) {
  if (!company) return null;

  return {
    id: company.id,
    // Contact Details (Person entity)
    firstName: company.first_name,
    lastName: company.last_name,
    phone: company.phone,
    email: company.email,
    preferredContactMethod: company.preferred_contact_method || 'Phone',

    // Physical Address
    physicalStreetAddress: company.physical_street_address,
    physicalSuiteApt: company.physical_suite_apt,
    physicalCity: company.physical_city,
    physicalState: company.physical_state,
    physicalCountry: company.physical_country,
    physicalZip: company.physical_zip,

    // Mailing Address
    isMailingAddressSame: company.is_mailing_address_same,
    mailingStreetAddress: company.mailing_street_address,
    mailingSuiteApt: company.mailing_suite_apt,
    mailingCity: company.mailing_city,
    mailingState: company.mailing_state,
    mailingCountry: company.mailing_country,
    mailingZip: company.mailing_zip,

    // Business Information
    businessType: company.business_type,
    businessStarted: company.business_started,
    desiredBusinessName: company.desired_business_name,
    legalBusinessName: company.legal_business_name,
    hasDBA: company.has_dba,
    dbaName: company.dba_name,
    ein: company.ein,
    entityTypes: company.entity_types ? JSON.parse(company.entity_types) : [],

    // Transportation & Operations
    businessClassification: company.business_classification,
    transportationOperationType: company.transportation_operation_type,
    carriesPassengers: company.carries_passengers,
    transportsGoodsForHire: company.transports_goods_for_hire,
    engagedInInterstateCommerce: company.engaged_in_interstate_commerce,
    interstateIntrastate: company.interstate_intrastate,
    statesOfOperation: company.states_of_operation ? JSON.parse(company.states_of_operation) : [],
    operationClass: company.operation_class,
    hasUSDOTNumber: company.has_usdot_number,
    usdotNumber: company.usdot_number,

    // Fleet Information
    vehicleFleetType: company.vehicle_fleet_type,
    vehicleTypesUsed: company.vehicle_types_used ? JSON.parse(company.vehicle_types_used) : [],
    numberOfDrivers: company.number_of_drivers || 0,
    driverList: company.driver_list,
    numberOfVehicles: company.number_of_vehicles || 0,
    vehicleList: company.vehicle_list,
    gvwr: company.gvwr,
    yearMakeModel: company.year_make_model,

    // Cargo & Safety
    cargoTypesTransported: company.cargo_types_transported,
    hazmatPlacardRequired: company.hazmat_placard_required,
    phmsaWork: company.phmsa_work,

    // Regulatory Compliance
    additionalRegulatoryDetails: company.additional_regulatory_details ? JSON.parse(company.additional_regulatory_details) : [],

    // Company Ownership
    hasCompanyOwner: company.has_company_owner,
    companyOwnerFirstName: company.company_owner_first_name,
    companyOwnerLastName: company.company_owner_last_name,
    companyOwnerPhone: company.company_owner_phone,
    companyOwnerEmail: company.company_owner_email,

    // Financial Information
    hasDunsBradstreetNumber: company.has_duns_bradstreet_number,
    dunsBradstreetNumber: company.duns_bradstreet_number,

    // System Fields
    software: company.software,
    createdAt: company.created_at,
    updatedAt: company.updated_at
  };
}

// GET /api/companies - List all companies
router.get('/', asyncHandler(async (req, res) => {
  const companies = await runQuery('SELECT * FROM companies ORDER BY created_at DESC');
  const transformedCompanies = companies.map(transformCompany).filter(Boolean);
  res.json(transformedCompanies);
}));

// GET /api/companies/:id - Get single company
router.get('/:id', asyncHandler(async (req, res) => {
  const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [req.params.id]);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json(transformCompany(company));
}));

// POST /api/companies - Create new company
router.post('/', validateCompanyData, asyncHandler(async (req, res) => {
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
  res.status(201).json(transformCompany(company));
}));

// PUT /api/companies/:id - Update company
router.put('/:id', validateCompanyData, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Build dynamic update query
  const updateFields = [];
  const updateValues = [];

  // Map frontend field names to database column names
  const fieldMapping = {
    legalBusinessName: 'legal_business_name',
    dbaName: 'dba_name',
    businessType: 'business_type',
    ein: 'ein',
    physicalStreetAddress: 'physical_street_address',
    physicalCity: 'physical_city',
    physicalState: 'physical_state',
    physicalZip: 'physical_zip',
    // Add other fields as needed...
  };

  Object.entries(updates).forEach(([key, value]) => {
    const dbField = fieldMapping[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase();
    updateFields.push(`${dbField} = ?`);
    updateValues.push(value);
  });

  updateValues.push(new Date().toISOString()); // updated_at
  updateValues.push(id);

  const updateQuery = `UPDATE companies SET ${updateFields.join(', ')}, updated_at = ? WHERE id = ?`;

  await runExecute(updateQuery, updateValues);

  const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [id]);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  res.json(transformCompany(company));
}));

// DELETE /api/companies/:id - Delete company
router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await runExecute('DELETE FROM companies WHERE id = ?', [req.params.id]);
  res.json({ deleted: result.changes > 0 });
}));

module.exports = router;
