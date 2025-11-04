# Audit: Fabricated vs Real FMCSA Questions

## ❌ FABRICATED - Must Remove

### 1. **"Will the Applicant operate as a Driveaway?"**
- **Status:** DOES NOT EXIST on real form
- **Why:** There's no separate driveaway operation question
- **Reality:** "Drive Away/Tow Away" is checkbox #5 in cargo classifications (Page 41)
- **Action:** REMOVE from field comparisons (line 672)

---

## ✅ REAL - Keep These

### 1. **"Will the Applicant operate as a Towaway?"**
- **Status:** EXISTS - Page 40
- **Field:** questionCode_B0051P050331S05033_Q05022

### 2. **Tow/Driveway vehicle columns**  
- **Status:** EXISTS - Page 45, all 4 vehicle types
- **Fields:**
  - Q06004_STRAIGHT_TRUCK_DRIVEWAY
  - Q06008_TRUCK_TRACTOR_DRIVEWAY
  - Q06012_TRAILER_DRIVEWAY
  - Q06016_IEP_DRIVEWAY
- **Keep:** All tow/driveway vehicle count questions

### 3. **Cargo Classifications checkbox**
- **Status:** EXISTS - Page 41
- **Includes:** "Drive Away/Tow Away" as option #5
- **Keep:** Cargo classifications multi-select

---

## 🔍 Need to Verify

Questions that might be fabricated - need to check HTML forms:

1. "Ownership and Control" - need to verify exact wording
2. "Company Contact Middle Name" - verify this field exists
3. "Company Contact Suffix" - verify this field exists  
4. All compliance certification questions - verify exact wording matches forms

---

## Action Items

1. ✅ Remove "Driveaway" operation question
2. ⏳ Verify ALL other questions match exact HTML form text
3. ⏳ Remove any other fabricated questions
4. ⏳ Ensure field names match actual form field IDs

---

**RULE:** Every question must have a corresponding HTML file and exact field ID.

