# URS Application - Complete Branching Decision Tree

## OBJECTIVE
Ensure we've captured EVERY possible page by testing all branching paths through the URS application.

---

## SCENARIO #1: FOR-HIRE INTERSTATE MOTOR CARRIER (General Freight)
**STATUS:** ✅ FULLY CAPTURED (77 pages, 0-75)
**Path Taken:** This is what we just completed

### Key Answers That Defined This Path:
- Page 30: Intermodal Equipment Provider? **NO**
- Page 31: Transport Property? **YES**
- Page 32: For-Hire Property? **YES** (receive compensation)
- Page 33: Property Types? **General Freight** (checked)
- Page 34: Interstate Commerce? **YES**
- Page 36: Transport Passengers? **NO**
- Page 37: Broker Services? **NO**
- Page 38: Freight Forwarder? **NO**
- Page 39: Cargo Tank Facility? **NO**
- Page 40: Towaway Operation? **NO**
- Page 57: Property in Vehicles >= 10,001 lbs? **YES**
- Page 60: Affiliation Relationships? **NO**

### Sections Encountered:
1. ✅ Application Contact (Pages 11-14)
2. ✅ Business Description (Pages 15-28, Summary: 28)
3. ✅ Operation Classification (Pages 29-42, Summary: 42)
4. ✅ Vehicles (Pages 43-49, Summary: 49)
5. ✅ Drivers (Pages 50-55, Summary: 55)
6. ✅ Financial Responsibility (Pages 56-58)
7. ✅ Affiliation With Others (Pages 59-61, Summary: 61)
8. ✅ Certification Statement (Pages 62-63)
9. ✅ Compliance Certifications (Pages 64-72, Summary: 72)
10. ✅ Applicants Oath (Pages 73-74)
11. ✅ Identity Verification (Page 75)

### Branches SKIPPED (36% → 72% jump):
- Passenger Carrier pages (answered NO to passengers)
- Broker-specific pages (answered NO to broker)
- Freight Forwarder pages (answered NO to forwarder)
- Cargo Tank Facility pages (answered NO to tank facility)
- Towaway pages (answered NO to towaway)

**Progress Jumps Observed:**
- 27% → 32% (Operation Classification → Vehicles)
- 32% → 36% (Vehicles → Drivers)
- 36% → 72% (Drivers → Financial Responsibility) **← HUGE JUMP = SKIPPED SECTIONS**
- 72% → 77% (Financial → Affiliation)
- 77% → 86% (Affiliation → Certification)
- 86% → 90% (Certification → Compliance)
- 90% → 95% (Compliance → Oath)
- 95% → 99% (Oath → Identity Verification)

---

## CRITICAL BRANCHING QUESTIONS TO EXPLORE

### **BRANCH A: Intermodal Equipment Provider (Page 30)**
**Current Answer:** NO
**Need to Test:** YES

**Expected Impact:**
- Additional IEP-specific questions
- Different vehicle categorization
- IEP-specific insurance requirements
- May reveal Branch B008 pages (likely skipped in our path)

**How to Test:**
```
Page 30: Will operate as Intermodal Equipment Provider?
Answer: YES
→ Capture all subsequent IEP-specific pages
```

---

### **BRANCH B: Passenger Carrier (Page 36)**
**Current Answer:** NO
**Need to Test:** YES

**Expected Impact:**
- Passenger carrier-specific questions
- Passenger vehicle types
- Passenger insurance requirements
- May reveal Branch B008/B009 pages (for-hire passenger vs private passenger)

**How to Test:**
```
Page 31: Transport Property? NO
Page 36: Transport Passengers? YES
→ Follow passenger carrier path
→ Capture passenger-specific pages
```

**Sub-Branches:**
- For-hire passenger carrier (buses for compensation)
- Private passenger carrier (business use)
- Private passenger carrier (non-business - church vans, etc.)

---

### **BRANCH C: Property Broker (Page 37)**
**Current Answer:** NO
**Need to Test:** YES

**Expected Impact:**
- Broker-specific questions (arranges transportation, doesn't transport)
- Broker bond requirements ($75K)
- Different financial responsibility pages
- May reveal Branch B010 pages

**How to Test:**
```
Page 31: Transport Property? YES
Page 32: For-Hire? YES
Page 37: Broker Services? YES
→ Capture broker-specific pages
```

---

### **BRANCH D: Freight Forwarder (Page 38)**
**Current Answer:** NO
**Need to Test:** YES

**Expected Impact:**
- Freight forwarder-specific questions
- Consolidation/break-bulk operations
- May or may not operate own vehicles
- May reveal Branch B011 pages

**How to Test:**
```
Page 38: Freight Forwarder Services? YES
→ Capture forwarder-specific pages
```

---

### **BRANCH E: Cargo Tank Facility (Page 39)**
**Current Answer:** NO
**Need to Test:** YES

**Expected Impact:**
- Tank manufacturer/tester/inspector questions
- Not a carrier - different requirements entirely
- CFR Part 178/180 compliance
- May reveal Branch B012 pages

**How to Test:**
```
Page 39: Cargo Tank Facility? YES
→ Capture facility-specific pages
```

---

### **BRANCH F: Towaway Operation (Page 40)**
**Current Answer:** NO
**Need to Test:** YES

**Expected Impact:**
- Towaway-specific questions
- Vehicle delivery operations
- May reveal additional Branch B012 or B013 pages

**How to Test:**
```
Page 40: Towaway Operation? YES
→ Capture towaway-specific pages
```

---

### **BRANCH G: Private Property Carrier (Page 32)**
**Current Answer:** For-Hire (YES to compensation)
**Need to Test:** Private (NO to compensation)

**Expected Impact:**
- Private carrier questions (own property only)
- NO MC Number required
- Different insurance requirements
- Simpler application (fewer pages)

**How to Test:**
```
Page 31: Transport Property? YES
Page 32: Receive compensation for transporting property of others? NO
Page 35: Transport own property? YES
→ Capture private carrier pages
```

---

### **BRANCH H: Hazardous Materials (Page 33)**
**Current Answer:** General Freight only
**Need to Test:** Hazmat selected

**Expected Impact:**
- Hazmat-specific questions
- Higher insurance requirements ($1M-$5M)
- Additional certifications

**How to Test:**
```
Page 33: Property Types? 
Check: Hazardous Materials
→ Capture hazmat-specific questions
```

---

### **BRANCH I: Household Goods (Page 33)**
**Current Answer:** General Freight only
**Need to Test:** Household Goods

**Expected Impact:**
- HHG-specific questions
- HHG broker vs HHG carrier
- Tariff and estimate requirements

**How to Test:**
```
Page 33: Property Types?
Check: Household Goods
→ Capture HHG-specific questions
```

---

### **BRANCH J: Intrastate-Only Carrier (Page 34)**
**Current Answer:** Interstate (YES)
**Need to Test:** Intrastate-Only (NO)

**Expected Impact:**
- May skip some federal requirements
- State-specific compliance only
- Potentially shorter application

**How to Test:**
```
Page 34: Interstate Commerce? NO
→ Capture intrastate-only path
```

---

### **BRANCH K: Affiliation With Others (Page 60)**
**Current Answer:** NO affiliations
**Need to Test:** YES affiliations

**Expected Impact:**
- Additional pages to enter affiliated entity details
- DOT/MC numbers of related companies
- Relationship types and dates
- May add 3-5 pages

**How to Test:**
```
Page 60: Affiliation relationships? YES
→ Capture affiliation detail pages
```

---

### **BRANCH L: Property < 10,001 lbs (Page 57)**
**Current Answer:** >= 10,001 lbs (YES)
**Need to Test:** < 10,001 lbs (NO)

**Expected Impact:**
- Lower insurance minimums
- Potentially exempt from certain requirements

**How to Test:**
```
Page 57: Property in vehicles >= 10,001 lbs? NO
→ Capture lower-weight carrier path
```

---

### **BRANCH M: Currently Revoked Registration (Page 70)**
**Current Answer:** Not revoked (presumably)
**Need to Test:** Currently revoked (requires deficiency documentation)

**Expected Impact:**
- Additional pages for corrective action documentation
- Safety improvement plans
- May add pages for proof of corrections

**How to Test:**
```
Page 69: Not prohibited by suspension/revocation? 
Answer in way that triggers Page 70's conditional logic
→ Capture revoked carrier remediation pages
```

---

## ESTIMATED TOTAL PAGE COUNT BY SCENARIO

Based on the 36% → 72% jump (indicating ~40 pages were skipped), I estimate:

| Scenario Type | Estimated Pages | Notes |
|---------------|-----------------|-------|
| **Captured: For-Hire Interstate Property** | 77 pages | What we have |
| **Passenger Carrier (For-Hire)** | +35-45 pages | Branch B008 |
| **Passenger Carrier (Private)** | +25-35 pages | Branch B009 |
| **Broker-Only** | +15-25 pages | Branch B010 |
| **Freight Forwarder** | +15-25 pages | Branch B011 |
| **Cargo Tank Facility** | +20-30 pages | Branch B012 |
| **Towaway Operation** | +10-20 pages | Part of B012? |
| **IEP (Intermodal Equipment)** | +10-20 pages | Within B005? |
| **Affiliation Details** | +5-10 pages | Conditional |
| **Hazmat-Specific** | +5-10 pages | Conditional within property |
| **HHG-Specific** | +5-10 pages | Conditional within property |
| **Revoked Carrier** | +3-8 pages | Conditional |

**TOTAL ESTIMATED UNIQUE PAGES: 200-300 pages**

---

## RECOMMENDED EXPLORATION ORDER

### **Priority 1: Major Operation Types** (Highest Impact)
1. ✅ For-Hire Interstate Property Carrier (DONE)
2. ⏳ **For-Hire Interstate Passenger Carrier**
3. ⏳ **Broker-Only** (no transport operations)
4. ⏳ **Freight Forwarder**
5. ⏳ **Private Property Carrier** (no compensation)

### **Priority 2: Specialized Operations**
6. ⏳ **Intermodal Equipment Provider**
7. ⏳ **Cargo Tank Facility**
8. ⏳ **Towaway Operation**

### **Priority 3: Cargo Type Variations**
9. ⏳ **Hazardous Materials Carrier**
10. ⏳ **Household Goods Carrier**

### **Priority 4: Edge Cases**
11. ⏳ **Intrastate-Only Carrier**
12. ⏳ **With Affiliations** (YES to Page 60)
13. ⏳ **Vehicles < 10,001 lbs**
14. ⏳ **Previously Revoked Carrier**

---

## NEXT STEPS - SYSTEMATIC CAPTURE PLAN

### **Step 1: Map Critical Decision Points**
I'll create a table of every YES/NO or multi-choice question that creates branches:

| Page | Question | Current Answer | Need to Test | Expected Page Impact |
|------|----------|----------------|--------------|---------------------|
| 30 | Intermodal Equipment Provider? | NO | YES | +10-20 pages |
| 31 | Transport Property? | YES | NO | Different path entirely |
| 32 | For-Hire Property? | YES | NO (Private) | -20 pages, different requirements |
| 33 | Property Types? | General Freight | Hazmat, HHG | +5-15 pages each |
| 34 | Interstate Commerce? | YES | NO (Intrastate) | -10-20 pages |
| 36 | Transport Passengers? | NO | YES | +35-45 pages |
| 37 | Broker Services? | NO | YES | +15-25 pages |
| 38 | Freight Forwarder? | NO | YES | +15-25 pages |
| 39 | Cargo Tank Facility? | NO | YES | +20-30 pages |
| 40 | Towaway Operation? | NO | YES | +10-20 pages |
| 57 | Property >= 10,001 lbs? | YES | NO | Different insurance calc |
| 60 | Affiliation Relationships? | NO | YES | +5-10 pages |

### **Step 2: Create Test Matrix**
For each scenario, I need to know:
1. **Starting answers** (Pages 1-29 are mostly the same)
2. **Branching answers** (Pages 30-42 determine operation type)
3. **Expected new pages** to capture
4. **How to identify we've reached the end** of that branch

### **Step 3: Systematic Capture Protocol**
For each new scenario:
1. Start fresh URS application
2. Fill Pages 1-29 identically (or with minimal variation)
3. Answer branching questions to trigger new path
4. Capture ONLY pages we haven't seen before
5. Document which answers led to which pages

---

## QUESTIONS FOR YOU

### **1. Which scenario should we capture NEXT?**
I recommend: **For-Hire Interstate Passenger Carrier** (biggest branch, likely reveals 35-45 new pages)

**Answers needed:**
- Page 31: Transport Property? **NO**
- Page 36: Transport Passengers? **YES**
- Then follow passenger carrier questions

### **2. How do you want to identify duplicates vs new pages?**
I can track by:
- Form ID (e.g., `form_B0051P050021`)
- Question ID (e.g., `Q05002`)
- Content comparison

### **3. Should I create a tracking spreadsheet?**
Something like:

| Scenario | Pages Captured | New Pages | Total Unique Pages | Completion % |
|----------|----------------|-----------|-------------------|--------------|
| 1. For-Hire Interstate Property | 77 | 77 | 77 | 100% of Scenario 1 |
| 2. For-Hire Passenger | TBD | TBD | TBD | TBD |
| 3. Broker-Only | TBD | TBD | TBD | TBD |

### **4. Do you want me to create a "scenario answer sheet"?**
For each scenario, a guide showing:
- **Scenario Name:** For-Hire Interstate Passenger Carrier
- **Goal:** Capture passenger carrier pages
- **Page 2:** 3rd Party Provider? → NO
- **Page 16:** Dun & Bradstreet? → NO
- **Page 30:** IEP? → NO
- **Page 31:** Property? → NO
- **Page 36:** Passengers? → YES
- **Expected:** Will see passenger-specific questions for vehicle types, passenger counts, insurance, etc.

---

## PROPOSED NEXT ACTION

**I recommend we create a systematic exploration plan:**

1. **Document the current scenario** (already done - "For-Hire Interstate Property Carrier")
2. **Create answer sheets for the next 5-7 major scenarios**
3. **You run through each scenario in URS**
4. **I capture only NEW pages we haven't seen**
5. **Track progress toward 100% page coverage**

**Would you like me to create the answer sheets now for the top 5 scenarios to explore?**

That way you'll know exactly how to answer each question to trigger the branches we need to explore.

