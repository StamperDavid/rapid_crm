-- Qualified States Database Schema
-- This table contains state-specific regulatory thresholds that supersede federal regulations

CREATE TABLE IF NOT EXISTS qualified_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_name TEXT NOT NULL UNIQUE,
  state_code TEXT NOT NULL UNIQUE,
  
  -- DOT Weight Requirements (lbs GVWR)
  dot_weight_for_hire INTEGER,
  dot_weight_private_property INTEGER,
  dot_weight_notes TEXT,
  
  -- DOT Passenger Requirements
  dot_passengers_for_hire INTEGER,
  dot_passengers_private_property INTEGER,
  dot_passengers_notes TEXT,
  
  -- DOT Cargo Requirements
  dot_cargo_requirements TEXT,
  
  -- Driver Qualification Weight Requirements (lbs GVWR)
  dq_weight_for_hire INTEGER,
  dq_weight_private_property INTEGER,
  dq_weight_notes TEXT,
  
  -- Driver Qualification Passenger Requirements
  dq_passengers_for_hire INTEGER,
  dq_passengers_private_property INTEGER,
  dq_passengers_notes TEXT,
  
  -- Driver Qualification Cargo Requirements
  dq_cargo_requirements TEXT,
  
  -- Special Notes and Exemptions
  special_notes TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert qualified states data with correct values
INSERT INTO qualified_states (
  state_name, state_code,
  dot_weight_for_hire, dot_weight_private_property, dot_weight_notes,
  dot_passengers_for_hire, dot_passengers_private_property, dot_passengers_notes,
  dot_cargo_requirements,
  dq_weight_for_hire, dq_weight_private_property, dq_weight_notes,
  dq_passengers_for_hire, dq_passengers_private_property, dq_passengers_notes,
  dq_cargo_requirements,
  special_notes
) VALUES 
-- Alabama
('Alabama', 'AL', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Alaska  
('Alaska', 'AK', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Arizona
('Arizona', 'AZ', 26001, 26001, NULL, 9, 9, NULL, 'Hazmat Placard', 26001, 26001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- Arkansas
('Arkansas', 'AR', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- California
('California', 'CA', NULL, 10001, 'FH: Any - PP: 10001', 16, 16, NULL, 'Hazmat Placard', NULL, NULL, 'N/A', NULL, NULL, 'N/A', 'N/A', 'CA has similar record keeping requirements as DQ for CDL drivers'),

-- Colorado
('Colorado', 'CO', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Connecticut
('Connecticut', 'CT', 18001, 18001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 18001, 18001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Delaware
('Delaware', 'DE', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- District of Columbia
('District of Columbia', 'DC', NULL, 10001, 'FH: Any - PP: 10001', 16, 16, NULL, 'Hazmat Placard', 10001, 10001, NULL, NULL, NULL, 'N/A', 'Hazmat Placard', NULL),

-- Florida
('Florida', 'FL', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Georgia
('Georgia', 'GA', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Hawaii
('Hawaii', 'HI', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- Idaho
('Idaho', 'ID', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Illinois
('Illinois', 'IL', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Indiana
('Indiana', 'IN', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Iowa
('Iowa', 'IA', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Kansas
('Kansas', 'KS', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Kentucky
('Kentucky', 'KY', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 'DOT required at 26,001 for farm plated vehicles'),

-- Louisiana
('Louisiana', 'LA', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Maine
('Maine', 'ME', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- Maryland
('Maryland', 'MD', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- Massachusetts
('Massachusetts', 'MA', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Michigan
('Michigan', 'MI', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Minnesota
('Minnesota', 'MN', NULL, 10001, 'FH: Any - PP: 10001', 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL, 10001, 'FH: Any - PP: 10001', 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 'Exemptions for hazmat: 221.025'),

-- Mississippi
('Mississippi', 'MS', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Missouri
('Missouri', 'MO', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard or Hazmat 10,001', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard or Hazmat 10,001', NULL),

-- Montana
('Montana', 'MT', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Nebraska
('Nebraska', 'NE', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- Nevada
('Nevada', 'NV', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- New Hampshire
('New Hampshire', 'NH', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- New Jersey
('New Jersey', 'NJ', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 10001, 10001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- New Mexico
('New Mexico', 'NM', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- New York
('New York', 'NY', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- North Carolina
('North Carolina', 'NC', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- North Dakota
('North Dakota', 'ND', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL),

-- Ohio
('Ohio', 'OH', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- Oklahoma
('Oklahoma', 'OK', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Oregon
('Oregon', 'OR', 10001, 26001, 'FH: 10001 - PP: 26001', 9, 9, NULL, 'Hazmat Placard', 10001, 26001, 'FH: 10001 - PP: 26001', 9, 9, NULL, 'Hazmat Placard', NULL),

-- Pennsylvania
('Pennsylvania', 'PA', 17001, 17001, NULL, 9, 9, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 'Intrastate farm-plated & school bus exempt'),

-- Rhode Island
('Rhode Island', 'RI', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- South Carolina
('South Carolina', 'SC', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- South Dakota
('South Dakota', 'SD', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Tennessee
('Tennessee', 'TN', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Texas
('Texas', 'TX', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', 10001, 10001, NULL, 9, 9, NULL, 'Hazmat Placard', NULL),

-- Utah
('Utah', 'UT', 16001, 16001, NULL, 16, 16, NULL, 'Hazmat Placard', 16001, 16001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Vermont
('Vermont', 'VT', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Virginia
('Virginia', 'VA', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', 26001, 26001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Washington
('Washington', 'WA', 16001, 16001, NULL, 16, 16, NULL, 'Hazmat Placard', 16001, 16001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- West Virginia
('West Virginia', 'WV', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', 10001, 10001, NULL, 16, 16, NULL, 'Hazmat Placard', NULL),

-- Wyoming
('Wyoming', 'WY', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', 26001, 26001, NULL, 9, 16, 'FH: 9 - PP: 16', 'Hazmat Placard', NULL);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_qualified_states_state_code ON qualified_states(state_code);
CREATE INDEX IF NOT EXISTS idx_qualified_states_state_name ON qualified_states(state_name);