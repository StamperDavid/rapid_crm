-- Load All Service Schemas
-- This script loads all individual service schemas with their renewal management fields

-- USDOT Registration Service
.read service_schemas/usdot_service.sql

-- MC Number Service  
.read service_schemas/mc_service.sql

-- UCR Registration Service
.read service_schemas/ucr_service.sql

-- IFTA Service
.read service_schemas/ifta_service.sql

-- ELD Service
.read service_schemas/eld_service.sql

-- Hazmat Service
.read service_schemas/hazmat_service.sql

-- Insert default service records with renewal information
INSERT OR IGNORE INTO usdot_services (id, created_at, updated_at) 
VALUES ('usdot_001', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO mc_services (id, created_at, updated_at) 
VALUES ('mc_001', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO ucr_services (id, created_at, updated_at) 
VALUES ('ucr_001', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO ifta_services (id, created_at, updated_at) 
VALUES ('ifta_001', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO eld_services (id, created_at, updated_at) 
VALUES ('eld_001', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO hazmat_services (id, created_at, updated_at) 
VALUES ('hazmat_001', datetime('now'), datetime('now'));
