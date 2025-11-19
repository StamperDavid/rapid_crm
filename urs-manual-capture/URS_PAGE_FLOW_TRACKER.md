# URS Page Flow & Branching Logic Tracker

**Purpose:** Document all unique pages and branching logic discovered during manual URS exploration.

**Started:** November 19, 2025
**Application Type:** Third Party Service Provider

---

## Page Flow

### Page 00: Landing Page
- **File:** `page_00_landing.html`
- **Title:** Welcome to the Unified Registration System
- **Action:** Click "Take me to LOGIN.GOV" button
- **Next:** Page 01a (Login.gov Sign In)
- **Notes:** 
  - Entry point for all applications
  - For first-time applicants only (no existing USDOT number)
  - No branching logic - single path

### Page 01a: Login.gov Sign In
- **File:** `page_01_login_signin.html`
- **Title:** Sign in | Login.gov
- **Domain:** secure.login.gov (external authentication)
- **Fields:**
  - Email address (required)
  - Password (required)
  - "Show password" checkbox
  - reCAPTCHA (invisible)
- **Actions:**
  - Submit → Next: Page 01b (MFA)
  - "Sign in with your government employee ID" → PIV/CAC flow (not captured)
  - "Create an account" → Account creation flow (not captured)
  - "Forgot your password?" → Password reset flow (not captured)
- **Next:** Page 01b (MFA Authentication)
- **Notes:**
  - External Login.gov authentication system
  - 15-minute session timeout warning appears
  - Supports multiple authentication methods

### Page 01b: Login.gov MFA (Multi-Factor Authentication)
- **File:** `page_01_login_mfa.html`
- **Title:** Use face or touch unlock | Login.gov
- **Domain:** secure.login.gov (external authentication)
- **Fields:**
  - "Remember this browser" checkbox (optional)
- **Actions:**
  - "Use screen unlock" button → Biometric authentication
  - "Choose another authentication method" → Alternative MFA options
- **Next:** URS application pages (post-authentication)
- **Notes:**
  - WebAuthn-based face/fingerprint/touch authentication
  - Can skip on future logins if "Remember this browser" selected
  - Alternative methods available (SMS, authenticator app, etc.)
  - Session timeout continues from previous page

---

## Branching Logic Map

### Decision Points
(To be populated as pages are captured)

---

## Error States Captured
(To be populated as error pages are encountered)

---

## Page Variations
(To be populated when same page shows different fields based on prior selections)

---

## Statistics
- **Total Unique Pages:** 3 (1 URS + 2 Login.gov)
- **Decision Points:** 0
- **Error States:** 0
- **Page Variations:** 0

---

## Authentication Flow Summary

**Login.gov Authentication Sequence:**
1. Page 00 (URS Landing) → Click "Take me to LOGIN.GOV"
2. Page 01a (Login.gov Sign In) → Enter email/password → Submit
3. Page 01b (Login.gov MFA) → Complete biometric/MFA authentication
4. Return to URS → First actual application page

**RPA Agent Requirements for Authentication:**
- Must handle external domain redirect (URS → Login.gov → URS)
- Must store and submit Login.gov credentials
- Must handle MFA (preferably with "Remember this browser" to skip in future)
- Must detect successful authentication and return to URS domain
- Must handle session timeouts (15-minute warning at Login.gov)

