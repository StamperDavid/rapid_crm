# USDOT RPA Training Center - Redesign Plan

## Problem Statement
Current interface is:
- Too complex
- Field names not displaying
- RPA auto-fill not working
- Review appearing before data is filled
- Cluttered and confusing

## Solution: Simple 3-Panel Design (Like Alex Training Center)

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  USDOT RPA Training Center      Scenarios: 15/25    Accuracy: 94%│
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐   │
│  │ LEFT: Scenario Info     │  │ RIGHT: RPA Filled Application│   │
│  │                         │  │                              │   │
│  │ Company: ABC Trucking   │  │ ✓ Legal Business Name:       │   │
│  │ State: California       │  │   ABC Trucking LLC           │   │
│  │ Type: For-Hire         │  │                              │   │
│  │ Interstate: Yes         │  │ ✓ Form of Business:          │   │
│  │ Fleet: 5 trucks         │  │   LLC                        │   │
│  │                         │  │                              │   │
│  │ Expected Requirements:  │  │ ✓ EIN: 12-3456789           │   │
│  │ ✓ USDOT                │  │                              │   │
│  │ ✓ MC Authority         │  │ ✓ Phone: (555) 123-4567     │   │
│  │ ✓ IFTA                 │  │                              │   │
│  │ ✗ Hazmat               │  │ ✗ Interstate Vehicles: 0     │   │
│  │                         │  │   (Should be: 5)             │   │
│  │                         │  │   [✓ Correct] [✗ Incorrect] │   │
│  └─────────────────────────┘  └──────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Your Training Feedback:                                      │ │
│  │ [Text area for detailed corrections...]                      │ │
│  │                                                              │ │
│  │ [Mark All Correct & Continue] [Has Errors - Train & Continue]│ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Key Changes

### 1. Simplify Field Review
Instead of 51 individual fields, group into meaningful sections:
- Business Info (5 fields shown as one group)
- Contact Info (4 fields shown as one group)
- Operations (3 key fields)
- Vehicles (2 summary fields)
- Drivers (2 summary fields)
- Signature (1 field)

Total: ~15-20 review items instead of 51

### 2. Show Only Mismatches
- Auto-mark matching fields as correct
- Only show fields that DON'T match for review
- Reduces cognitive load

### 3. Better Field Labels
Use actual USDOT question text:
- "What is your Legal Business Name?" 
- "Do you operate in Interstate Commerce?"
- "How many vehicles operate interstate?"

### 4. Fix Auto-Fill Flow
1. Click "Start Training"
2. Scenario loads
3. Form is EMPTY initially
4. Click "Watch RPA Auto-Fill"
5. RPA ACTUALLY fills each field with animation
6. When complete, review button appears
7. Click review to see comparison

## Implementation Priority

1. Fix auto-fill to actually populate data
2. Simplify to 15-20 key fields (not 51)
3. Clean up the UI
4. Make it look like Alex Training Center


