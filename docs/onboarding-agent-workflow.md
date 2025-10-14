# Onboarding Agent Workflow - Transportation Compliance Agency

## Business Context
Rapid CRM is a **Transportation Compliance Agency** that helps potential clients understand and obtain the necessary registrations to start a transportation company legally.

## Onboarding Agent Purpose
The onboarding agent serves as the **first point of contact** for potential clients who are researching how to start a transportation company and need guidance on required registrations and compliance.

## Deployment
- **Hosted on company website** as chatbot and standalone units
- **Public-facing** - accessible to anyone researching transportation compliance
- **Lead generation tool** - converts website visitors into qualified leads

## Client Journey & Workflow

### Phase 1: Information Gathering & Education
**Client Intent**: "I want to start a transportation company - what do I need?"

**Onboarding Agent Responsibilities**:
1. **Answer transportation compliance questions**
   - Explain USDOT requirements
   - Clarify state vs federal regulations
   - Provide guidance on business structure requirements
   - Explain different types of transportation operations

2. **Guide regulatory determinations**
   - Help client understand which regulations apply to their business
   - Determine required registrations based on:
     - Business type (trucking, passenger, etc.)
     - Operating radius (intrastate vs interstate)
     - Vehicle types and weights
     - Cargo types (hazardous materials, etc.)
     - Number of vehicles/drivers

3. **Collect required information**
   - Business information (name, address, EIN, etc.)
   - Contact information
   - Business structure details
   - Operating details (routes, cargo, vehicles)
   - Any existing registrations

### Phase 2: Service Determination & Pricing
**Once all information is collected**:

1. **Provide regulatory requirements**
   - List all required registrations for their specific business
   - Explain what each registration covers
   - Provide timeline expectations

2. **Offer services with competitive pricing**
   - Present our service packages
   - Compare our prices to competitors
   - Highlight our value proposition
   - Explain our process and expertise

### Phase 3: Client Decision & CRM Management

#### Scenario A: Client Declines Services
- **Action**: Save information as **LEAD** in CRM
- **Data to capture**:
  - All collected business information
  - Contact details
  - Regulatory requirements determined
  - Reason for declining (if provided)
  - Follow-up timeline

#### Scenario B: Client Accepts Services
- **Action**: Create **DEAL** in CRM
- **Two sub-scenarios**:
  
  **B1: USDOT Only**
  - Client wants only USDOT number registration
  - Create deal for USDOT service
  
  **B2: USDOT + Other Registrations**
  - Client wants USDOT + additional registrations (MC, IFTA, etc.)
  - Create deal for comprehensive service package

### Phase 4: Data Management (Critical)
**Regardless of client decision**, the onboarding agent must:

1. **Save to Company Profile**
   - Create or update company record in CRM
   - Ensure all business information is complete
   - Link contact information properly

2. **Create USDOT Application Record** (CRITICAL)
   - **Extra attention required** for USDOT application data
   - Must include ALL information needed for USDOT filing:
     - Legal business name
     - DBA name (if applicable)
     - EIN (Employer Identification Number)
     - Complete address information
     - Contact person details
     - Business type and classification
     - Operating authority details
     - Any other USDOT-specific requirements

## Key Success Factors

### Information Accuracy
- **Zero tolerance for errors** in USDOT application data
- **Complete data collection** - missing information delays processing
- **Proper classification** of business type and requirements

### Client Experience
- **Educational approach** - help clients understand requirements
- **Transparent pricing** - clear comparison with competitors
- **Professional guidance** - build trust and credibility

### CRM Data Quality
- **Complete company profiles** with all business details
- **Accurate USDOT application records** ready for processing
- **Proper lead/deal classification** for sales follow-up

## Training Requirements for Onboarding Agent

### Knowledge Areas
1. **Transportation Regulations**
   - USDOT requirements and thresholds
   - State vs federal jurisdiction
   - Different types of operating authority
   - Vehicle weight classifications
   - Hazardous materials requirements

2. **Business Process Understanding**
   - Lead vs deal classification
   - CRM data entry requirements
   - USDOT application data requirements
   - Service pricing and packages

3. **Client Communication**
   - Educational conversation style
   - Question-asking techniques
   - Information gathering methods
   - Service presentation skills

### Critical Skills
- **Regulatory knowledge** - accurate compliance guidance
- **Data collection** - systematic information gathering
- **CRM proficiency** - proper data entry and classification
- **Sales skills** - service presentation and objection handling

## Current Status
**Workflow is defined up to CRM data entry phase**
- Next steps would involve handoff to USDOT RPA agent for actual filing
- Integration with payment processing
- Client communication during application process
- Follow-up and relationship management

This workflow represents the **conversion funnel** from website visitor to qualified lead/deal, with emphasis on education, accurate data collection, and proper CRM management.



