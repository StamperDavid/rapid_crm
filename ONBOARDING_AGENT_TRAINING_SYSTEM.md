# Onboarding Agent Training System - Complete Guide

## 🎯 What We Built

A comprehensive AI training and knowledge management system that ensures your onboarding agent makes **accurate, verifiable compliance determinations** based on real regulatory data.

---

## 🔑 Critical Regulatory Logic (NOW IMPLEMENTED)

### The Core Rules

```
IF Interstate Operation:
  ✓ ALWAYS use Federal 49 CFR (10,001+ lbs GVWR / 8+ passengers)
  ✓ Qualified States List does NOT apply
  
IF Intrastate Operation:
  ✓ Use Qualified States List for that specific state
  ✓ Qualified States List SUPERSEDES federal thresholds
  ✓ Each state has its own GVWR and passenger triggers
```

---

## 📦 What's Included

### 1. **Qualified States Management System**
**Location:** Admin Toolbar → "Qualified States"

**Features:**
- ✅ Upload Excel (.xlsx), CSV (.csv), or OpenDocument (.ods) files
- ✅ View all state-specific thresholds in searchable table
- ✅ Edit individual states manually
- ✅ Export current data to CSV
- ✅ Automatic database storage with versioning

**Database Schema:** `src/database/qualified_states_schema.sql`
- `qualified_states` - Main state thresholds table
- `compliance_determination_log` - Tracks every determination for training
- `regulatory_training_scenarios` - Test cases
- `agent_training_performance` - Performance tracking

### 2. **Compliance Rules Engine**
**Location:** `src/services/compliance/ComplianceRulesEngine.ts`

**How It Works:**
1. Takes client operation details (state, interstate/intrastate, vehicles, cargo)
2. Queries database for correct thresholds
3. Applies proper logic: Interstate = Federal, Intrastate = Qualified States
4. Returns complete compliance requirements with costs
5. Logs every determination for training data

**Key Methods:**
- `determineCompliance()` - Main entry point
- `getApplicableThresholds()` - Chooses Federal vs Qualified States
- `checkUSDOTRequirement()` - Checks GVWR/passenger thresholds
- `checkAuthorityRequirement()` - Determines if MC authority needed
- `logDetermination()` - Saves for training

### 3. **API Endpoints**
All accessible at `http://localhost:3001/api/`

**Qualified States Management:**
- `GET /qualified-states` - Get all states
- `GET /qualified-states/:id` - Get single state
- `POST /qualified-states` - Add new state
- `PUT /qualified-states/:id` - Update state
- `DELETE /qualified-states/:id` - Delete state
- `POST /qualified-states/upload` - Upload Excel/CSV/ODS file

**Compliance Logging:**
- `POST /compliance-log` - Log determination (for training)

---

## 🚀 Getting Started - Step by Step

### Step 1: Upload Your Qualified States Data

1. **Restart your server** to initialize the new database tables:
   ```bash
   npm start
   ```
   Look for: `✅ Qualified States schema loaded successfully`

2. **Navigate to Qualified States Management:**
   - Login as admin
   - Top right toolbar → Click "Qualified States"

3. **Upload your .ods file:**
   - Click "Upload File" button
   - Select your file: `qualified_states-68489a20381f32.08174301 (1).ods`
   - System will automatically parse and import all states

4. **Verify the data:**
   - Review the table to ensure all states loaded correctly
   - Check GVWR and passenger thresholds for accuracy
   - Make any necessary edits using the edit button

### Step 2: Test the Compliance Engine

Create a test file to verify the logic works correctly:

```typescript
// test-compliance-engine.ts
import { complianceRulesEngine } from './src/services/compliance/ComplianceRulesEngine';

async function testCompliance() {
  // Test 1: Interstate Operation (should use Federal)
  const interstateTest = {
    stateCode: 'TX',
    operationType: 'for_hire' as const,
    operationRadius: 'interstate' as const,
    cargoTypes: ['general freight'],
    vehicles: [{
      type: 'truck' as const,
      gvwr: 12000,
      year: 2020,
      make: 'Ford',
      model: 'F-450'
    }]
  };

  console.log('=== INTERSTATE TEST ===');
  const interstateResult = await complianceRulesEngine.determineCompliance(interstateTest);
  console.log('Determination Logic:', interstateResult.determinationLogic);
  console.log('Applied Thresholds:', interstateResult.appliedThresholds);
  console.log('Requires USDOT:', interstateResult.requiresUSDOT);
  console.log('Requires Authority:', interstateResult.requiresAuthority);
  console.log('Total Cost: $', interstateResult.totalCost);
  
  // Test 2: Intrastate Operation (should use Qualified States)
  const intrastateTest = {
    stateCode: 'TX',
    operationType: 'private' as const,
    operationRadius: 'intrastate' as const,
    cargoTypes: ['own goods'],
    vehicles: [{
      type: 'truck' as const,
      gvwr: 12000,
      year: 2020,
      make: 'Ford',
      model: 'F-450'
    }]
  };

  console.log('\n=== INTRASTATE TEST ===');
  const intrastateResult = await complianceRulesEngine.determineCompliance(intrastateTest);
  console.log('Determination Logic:', intrastateResult.determinationLogic);
  console.log('Applied Thresholds:', intrastateResult.appliedThresholds);
  console.log('Requires USDOT:', intrastateResult.requiresUSDOT);
  console.log('Total Cost: $', intrastateResult.totalCost);
}

testCompliance();
```

### Step 3: Integrate with Onboarding Agent

Now you need to update `src/services/ai/OnboardingAgentService.ts` to use the new `ComplianceRulesEngine`:

```typescript
// In OnboardingAgentService.ts
import { complianceRulesEngine } from '../compliance/ComplianceRulesEngine';

// Replace the determineComplianceRequirements method with:
private async determineComplianceRequirements(
  clientData: USDOTApplicationData,
  vehicles: any[]
): Promise<ComplianceRequirement[]> {
  
  const operationDetails = {
    stateCode: clientData.businessAddress.state,
    operationType: clientData.operationType,
    operationRadius: clientData.operationRadius,
    cargoTypes: clientData.cargoType,
    vehicles: clientData.vehicles
  };

  const determination = await complianceRulesEngine.determineCompliance(operationDetails);
  
  return determination.requirements;
}
```

---

## 📊 How to Train & Improve the Agent

### 1. Monitor Determinations

Every compliance determination is logged to `compliance_determination_log` table with:
- Client details
- Thresholds applied
- Requirements determined
- Logic used

### 2. Review & Correct

When you find an incorrect determination:

```typescript
// Mark as incorrect and provide correction
await complianceRulesEngine.logDetermination(
  operationDetails,
  determination,
  false, // isCorrect = false
  "Should require MC authority because..." // correction notes
);
```

### 3. Create Training Scenarios

Add to `regulatory_training_scenarios` table:
- Specific test cases with known correct answers
- Run agent through scenarios
- Track pass/fail rates
- Improve based on failures

### 4. Update Qualified States

As regulations change:
1. Go to Qualified States Management
2. Upload new data file or edit manually
3. System automatically uses latest data
4. Re-test with training scenarios

---

## 🎓 Next Steps for Full Training System

### Still To Build (Lower Priority):

1. **Training Scenarios Interface** (TODO #5)
   - Visual interface to create test cases
   - Run agent through scenarios
   - Grade accuracy automatically
   - Show pass/fail with explanations

2. **Knowledge Review Interface** (TODO #6)
   - Admin reviews agent determinations
   - Marks as correct/incorrect
   - Provides corrections
   - Corrections become training data

3. **Agent Performance Dashboard**
   - View accuracy over time
   - See common errors
   - Track improvement
   - Compare to training scenarios

---

## 🔧 Technical Architecture

```
User Input (Company, State, Vehicles, etc.)
    ↓
OnboardingAgentService
    ↓
ComplianceRulesEngine.determineCompliance()
    ↓
Query Database for Qualified States
    ↓
Apply Correct Logic:
    - Interstate → Federal 49 CFR
    - Intrastate → Qualified States List
    ↓
Return Requirements + Cost
    ↓
Log to compliance_determination_log
    ↓
(Optional) Admin Reviews & Corrects
    ↓
Corrections → Training Data
    ↓
Agent Improves Over Time
```

---

## ✅ What You Can Do RIGHT NOW

1. **Upload your qualified states data**
   - The interface is ready
   - Your .ods file will work perfectly

2. **Test the compliance logic**
   - Create test cases
   - Verify interstate vs intrastate logic
   - Check that costs are correct

3. **Review determinations**
   - Every determination is logged
   - Query the database to see what the agent is deciding
   - Find patterns in errors

4. **Manually correct errors**
   - When you find a wrong determination
   - Update the logic or qualified states data
   - Re-test to verify fix

---

## 📝 File Reference

### Key Files Created/Modified:
- `src/database/qualified_states_schema.sql` - Database schema
- `src/pages/QualifiedStatesManagement.tsx` - Upload interface
- `src/services/compliance/ComplianceRulesEngine.ts` - Logic engine
- `src/components/AdminToolbar.tsx` - Added navigation link
- `src/App.tsx` - Added route
- `server.js` - Added API endpoints (lines 6148-6500+)

### Database Tables:
- `qualified_states` - State-specific thresholds
- `federal_regulations` - Federal 49 CFR baseline
- `compliance_determination_log` - Training data
- `regulatory_training_scenarios` - Test cases
- `agent_training_performance` - Performance metrics
- `regulatory_knowledge_base` - Document storage

---

## 🎯 Success Criteria

You'll know it's working when:

✅ You can upload your qualified states file  
✅ Interstate operations use Federal thresholds (10,001 lbs / 8 passengers)  
✅ Intrastate operations use state-specific thresholds from your file  
✅ Agent makes correct compliance determinations  
✅ Every determination is logged for review  
✅ You can correct wrong determinations  
✅ Corrections improve future determinations  

---

## 🚨 Important Notes

### Interstate vs Intrastate

**This is the most critical distinction:**
- Interstate = crosses state lines = Federal rules ALWAYS
- Intrastate = within one state = Qualified States rules

The agent MUST ask "Do you cross state lines?" early in the conversation.

### Qualified States Hierarchy

For INTRASTATE operations only:
1. Qualified States List (YOUR file) - **HIGHEST PRIORITY**
2. State regulations - If not in qualified list
3. Federal 49 CFR - Fallback only

For INTERSTATE operations:
1. Federal 49 CFR - **ALWAYS AND ONLY**

### Payment Processing

You mentioned the agent needs to "collect payments" - this is separate from compliance determination. After compliance is determined and costs calculated, you'll need to integrate payment processing (Stripe, Square, etc.). The compliance engine provides the correct total cost.

---

## 🤝 Next Session Goals

1. Upload your qualified states data
2. Test a few scenarios (give me specific examples)
3. I'll help you verify the logic is correct
4. We'll build the training scenarios interface
5. We'll create the admin review interface

**Your system is now set up to learn from YOU (the expert) and make consistent, accurate determinations based on REAL regulatory data, not guesses.**





