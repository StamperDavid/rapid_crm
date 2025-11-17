# 🔐 How to Access RPA Credentials Management

## ✅ Now Integrated into Your Dashboard!

The **Employee Credentials** and **Identity Documents** management features are now accessible from your CRM admin dashboard.

---

## 📍 **How to Access**

### Step 1: Start Your Dev Server
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npm run dev:full
```

### Step 2: Navigate to User Management

**Option A: Direct URL**
```
http://localhost:5173/crm/users
```

**Option B: From Dashboard Navigation**
1. Open your CRM dashboard: `http://localhost:5173/`
2. Click **"User Management"** in the sidebar/navigation
3. (Or wherever you have the users/settings menu)

### Step 3: Click the "RPA Credentials" Tab

You'll see 5 tabs at the top:
- Users
- Roles
- **RPA Credentials** ← Click this one!
- Audit Logs
- Security

---

## 🎯 **What You'll See**

### Employee Selector
First, you'll see a dropdown to select which employee to manage:
```
┌─────────────────────────────────────────┐
│ Select Employee:                         │
│ ┌─────────────────────────────────────┐ │
│ │ Admin User (admin@rapidcrm.com)     │ │ ← Dropdown
│ │ Manager User (manager@rapidcrm.com) │ │
│ │ Compliance Officer (...)            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Login.gov Credentials Section
```
┌──────────────────────────────────────────────┐
│ Login.gov Credentials                         │
│                                               │
│ Login.gov Email:                              │
│ ┌──────────────────────────────────────────┐ │
│ │ user@example.com                         │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ Login.gov Password:                           │
│ ┌──────────────────────────────────────────┐ │
│ │ ••••••••••••                         👁️  │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ MFA Method:                                   │
│ ┌──────────────────────────────────────────┐ │
│ │ SMS Text Message                      ▼  │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ MFA Phone:                                    │
│ ┌──────────────────────────────────────────┐ │
│ │ +1 (555) 123-4567                        │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ [Save Credentials]  [Test Connection]        │
└──────────────────────────────────────────────┘
```

### Identity Documents Section
```
┌──────────────────────────────────────────────┐
│ Identity Documents                            │
│                                               │
│ ┌──────────────────────────────────────────┐ │
│ │ Current ID Document                      │ │
│ │                                          │ │
│ │ Type: DRIVER'S LICENSE                   │ │
│ │ Uploaded: 11/17/2025                     │ │
│ │ Status: ✅ Verified                      │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ Upload New Document:                          │
│                                               │
│ Document Type:                                │
│ ┌──────────────────────────────────────────┐ │
│ │ Driver's License                      ▼  │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ [Choose Front Image]  [Choose Back Image]    │
│                                               │
│ [Upload Identity Document]                    │
└──────────────────────────────────────────────┘
```

---

## 🚀 **Quick Test**

1. **Select an employee** from the dropdown
2. **Enter Login.gov credentials** (test data is fine for now)
3. **Click "Save Credentials"**
4. **Result:** You'll see a toast notification "Credentials saved successfully" (or an error if API not connected yet)

---

## ⚠️ **Current Status**

### ✅ What Works Now:
- UI components fully functional
- Form validation
- Visual feedback (loading states, toasts)
- Employee selection
- File upload interface

### ⏳ What Needs Backend (Next Step):
- Actual credential storage (requires API endpoints)
- Encryption on save (requires `server.js` updates)
- Loading credentials from database
- Test connection to Login.gov

---

## 🔧 **Next Implementation Steps**

### 1. Backend API Endpoints
Add to `server.js`:
- `GET /api/employees/:id/credentials`
- `POST /api/employees/:id/credentials`
- `POST /api/employees/:id/credentials/test`
- `GET /api/employees/:id/identity-document`
- `POST /api/employees/identity-document`

### 2. Database Migration
Run SQL to add columns to `users` table and create new tables.

### 3. Test End-to-End
Save credentials → Encrypt → Store → Load → Decrypt → Display

---

## 📸 **Screenshot Locations**

When you navigate to the page, you should see it under:
```
CRM Dashboard
└── User Management
    └── RPA Credentials (3rd tab)
        ├── Employee Selector
        ├── Login.gov Credentials Form
        └── Identity Documents Upload
```

---

## 💡 **Pro Tip**

Since the backend APIs aren't connected yet, you'll see:
- ✅ The UI loads perfectly
- ✅ Forms validate input
- ❌ "Failed to load credentials" (expected - no API yet)
- ❌ "Failed to save credentials" when clicking Save (expected - no API yet)

This is **normal and expected** until we add the backend endpoints!

---

## 🎯 **Want to See It Now?**

Run these commands:
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npm run dev:full
```

Then open: `http://localhost:5173/crm/users` and click the **"RPA Credentials"** tab!

---

**Questions?** The UI is fully functional and ready - we just need to connect the backend APIs next! 🚀


