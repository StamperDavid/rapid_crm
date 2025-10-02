# Service Schemas with Renewal Management

This directory contains individual service schema files, each with built-in renewal management fields. Each service is designed to handle its own renewal cycle, pricing, and compliance requirements.

## Service Types

### 1. USDOT Registration (`usdot_service.sql`)
- **Base Price**: $299.00
- **Renewal Price**: $199.00
- **Frequency**: Biennial (every 2 years)
- **Auto-renewal**: Yes
- **Requirements**: Company info, business address, EIN, fleet info, insurance

### 2. MC Number Registration (`mc_service.sql`)
- **Base Price**: $399.00
- **Renewal Price**: $299.00
- **Frequency**: Annual
- **Auto-renewal**: Yes
- **Requirements**: USDOT number, insurance, BOC-3, operating authority

### 3. UCR Registration (`ucr_service.sql`)
- **Base Price**: $199.00
- **Renewal Price**: $149.00
- **Frequency**: Annual
- **Auto-renewal**: Yes
- **Requirements**: USDOT number, company info, state operations

### 4. IFTA Registration (`ifta_service.sql`)
- **Base Price**: $299.00
- **Renewal Price**: $299.00
- **Frequency**: Annual
- **Auto-renewal**: Yes
- **Requirements**: USDOT number, fleet info, fuel records, mileage

### 5. ELD Compliance (`eld_service.sql`)
- **Base Price**: $249.00
- **Renewal Price**: $199.00
- **Frequency**: Annual
- **Auto-renewal**: Yes
- **Requirements**: Fleet info, driver info, current ELD system

### 6. Hazmat Permit (`hazmat_service.sql`)
- **Base Price**: $399.00
- **Renewal Price**: $249.00
- **Frequency**: Annual
- **Auto-renewal**: Yes
- **Requirements**: Hazmat classification, driver certs, vehicle specs

## Renewal Management Features

Each service includes:
- **Renewal Frequency**: How often the service needs to be renewed
- **Renewal Price**: Cost for renewal (may differ from initial price)
- **Auto-renewal**: Whether the service can be automatically renewed
- **Renewal Reminders**: Automated reminder schedule (90, 60, 30, 7 days)
- **Renewal Requirements**: What's needed for renewal
- **Renewal Deadline**: When renewal is due

## Usage

To load all service schemas:
```sql
.read load_all_service_schemas.sql
```

To load individual service schemas:
```sql
.read service_schemas/usdot_service.sql
.read service_schemas/mc_service.sql
-- etc.
```

## Business Logic

- **70% of revenue** comes from renewals
- **Selective renewal** - clients can choose which services to continue
- **Automated billing** for services they choose to renew
- **Compliance tracking** for services they let expire
- **Revenue protection** - don't lose clients to expired services
