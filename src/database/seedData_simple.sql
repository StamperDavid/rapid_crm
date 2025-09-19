-- Rapid CRM Database Seed Data (Simplified)
-- Populate database with basic mock data

-- Insert a simple company
INSERT INTO companies (
    id, first_name, last_name, phone, email, preferred_contact_method,
    physical_street_address, physical_city, physical_state, physical_zip,
    legal_business_name, business_type, ein, business_classification,
    transportation_operation_type, carries_passengers, transports_goods_for_hire,
    engaged_in_interstate_commerce, interstate_intrastate, operation_class,
    has_usdot_number, usdot_number, vehicle_fleet_type, number_of_drivers, number_of_vehicles,
    gvwr, cargo_types_transported, created_at, updated_at
) VALUES (
    '1', 'John', 'Doe', '(555) 123-4567', 'john@example.com', 'Phone',
    '123 Main St', 'Anytown', 'CA', '12345',
    'Example Transport LLC', 'Carrier', '12-3456789', 'Motor Carrier',
    'For-Hire', 'No', 'Yes',
    'Yes', 'Interstate', 'Property',
    'Yes', '123456', 'Truck', 2, 3,
    '26000', 'General Freight', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'
);

-- Insert a simple contact
INSERT INTO contacts (
    id, company_id, first_name, last_name, phone, email, job_title,
    is_primary_contact, preferred_contact_method, created_at, updated_at
) VALUES (
    '1', '1', 'Jane', 'Smith', '(555) 987-6543', 'jane@example.com', 'Manager',
    1, 'Phone', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'
);

-- Insert a simple deal
INSERT INTO deals (
    id, title, description, value, stage, probability, company_id, contact_id,
    created_at, updated_at
) VALUES (
    '1', 'Transportation Services', 'General freight transportation', 5000.00, 'qualified', 75, '1', '1',
    '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'
);
