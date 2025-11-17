# 🎭 Run Playwright Tests - Quick Start Guide

## ✅ Installation Complete!

Playwright is now installed and ready to test browser automation.

---

## 🚀 Run the Tests

### Option 1: Run All Tests (Recommended First)
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npx playwright test
```

**Expected Output:**
```
Running 6 tests using 1 worker

✓ [chromium] › basic-navigation.spec.ts:8:3 › FMCSA Website › should load FMCSA homepage (5s)
✓ [chromium] › basic-navigation.spec.ts:23:3 › FMCSA Website › should find USDOT registration link (3s)
✓ [chromium] › basic-navigation.spec.ts:36:3 › FMCSA Website › should navigate to URS portal (4s)
✓ [chromium] › basic-navigation.spec.ts:55:3 › FMCSA Website › should detect Login.gov integration (6s)
✓ [chromium] › basic-navigation.spec.ts:82:3 › FMCSA Website › should verify browser automation (8s)
✓ [chromium] › basic-navigation.spec.ts:114:3 › Rate Limiting › should respect delay (2s)

6 passed (28s)
```

---

### Option 2: Run With Browser Visible (Recommended for Debugging)
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npx playwright test --headed
```

This will show the browser window as tests run - **super helpful for seeing what's happening!**

---

### Option 3: Run Specific Test
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npx playwright test tests/rpa/basic-navigation.spec.ts
```

---

### Option 4: Debug Mode (Step Through Tests)
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npx playwright test --debug
```

This opens a debugger where you can step through each action!

---

### Option 5: Interactive UI Mode (BEST for Development)
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npx playwright test --ui
```

This opens a beautiful UI where you can:
- ✅ Run tests selectively
- ✅ Watch tests in real-time
- ✅ See screenshots and traces
- ✅ Replay failed tests

---

## 📸 View Screenshots

After running tests, check these files:
```
screenshots/
├─ fmcsa-homepage.png ........... FMCSA homepage
├─ urs-portal.png ............... URS portal (application system)
├─ login-detection.png .......... Login.gov detection
└─ automation-test.png .......... Automation capability test
```

Open them to see what the browser saw!

---

## 📊 View Test Report

After tests complete:
```powershell
npx playwright show-report
```

Opens an HTML report in your browser with:
- Test results
- Screenshots
- Videos (if any failed)
- Traces (detailed execution logs)

---

## 🎯 What These Tests Do

### Test 1: Load FMCSA Homepage ✅
- Navigates to `https://www.fmcsa.dot.gov/`
- Verifies page loads successfully
- Takes screenshot
- **Purpose:** Verify internet connection and FMCSA is accessible

### Test 2: Find USDOT Registration Link ✅
- Searches page for registration-related content
- Verifies USDOT information is present
- **Purpose:** Confirm registration functionality exists

### Test 3: Navigate to URS Portal ✅
- Goes to `https://ai.fmcsa.dot.gov/` (the actual application system)
- Captures screenshot
- **Purpose:** Verify we can access the filing portal

### Test 4: Detect Login.gov Integration ✅
- Checks if Login.gov authentication is present
- Looks for login buttons or redirects
- **Purpose:** Confirm we'll need Login.gov credentials for filing

### Test 5: Verify Browser Automation ✅
- Tests form filling (on Google as test)
- Tests screenshot capability
- Tests JavaScript execution
- **Purpose:** Confirm all automation features work

### Test 6: Rate Limiting Safety ✅
- Ensures 800ms delay between actions
- **Purpose:** Prevent getting blocked by FMCSA

---

## ⚠️ Important Notes

### These Are READ-ONLY Tests
- ✅ Safe to run anytime
- ✅ No applications submitted
- ✅ No data entered into FMCSA
- ✅ Just checking if automation works

### No Login.gov Credentials Needed Yet
- These tests don't attempt to login
- They just verify the pages are accessible
- Login testing comes later (after credentials configured)

---

## 🐛 Troubleshooting

### "npx: command not found"
**Solution:** Make sure you're in the project directory:
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
```

### Tests Timeout
**Solution:** Check your internet connection or increase timeout:
- Edit `playwright.config.ts`
- Change `timeout: 60 * 1000` to `timeout: 120 * 1000`

### Browser Doesn't Launch
**Solution:** Reinstall Chromium:
```powershell
npx playwright install chromium --force
```

### Port 5173 Already in Use
**Solution:** Stop the dev server or edit `playwright.config.ts`:
- Comment out the `webServer` section if you don't need it

---

## ✅ Expected Results

After running tests successfully, you should see:

1. ✅ **6 tests passed** (all green)
2. ✅ **4 screenshots** in `screenshots/` folder
3. ✅ **No errors** in console
4. ✅ **HTML report** available

If you see this, **Playwright is working perfectly!** 🎉

---

## 🚀 Next Steps After Tests Pass

1. ✅ **Verify screenshots** - Open them to see what browser captured
2. ✅ **View HTML report** - Run `npx playwright show-report`
3. ⏳ **Build LiveUSDOTRPAService** - Connect Playwright to RPA workflow
4. ⏳ **Test Login.gov authentication** - After credentials configured
5. ⏳ **Test form filling** - Start automating USDOT application

---

## 🎓 Learning Resources

### Playwright Documentation
- Official Docs: https://playwright.dev/
- Selectors: https://playwright.dev/docs/selectors
- Best Practices: https://playwright.dev/docs/best-practices

### Our Custom Guides
- `tests/rpa/README.md` - RPA-specific test documentation
- `LIVE_RPA_COMPREHENSIVE_PLANNING_ANSWERS.md` - Complete RPA plan
- `IMPLEMENTATION_COMPLETE_SUMMARY.md` - Implementation progress

---

## 💡 Pro Tips

### Tip 1: Always Run with --headed First
When developing new tests, use `--headed` to see what's happening:
```powershell
npx playwright test --headed
```

### Tip 2: Use UI Mode for Development
The UI mode is amazing for debugging:
```powershell
npx playwright test --ui
```

### Tip 3: Take Screenshots Liberally
Screenshots help debug issues - add them everywhere in production tests!

### Tip 4: Respect Rate Limits
Always include delays between actions to avoid getting blocked.

---

## 📞 Need Help?

If tests fail or you encounter issues:

1. Check the error message carefully
2. Look at screenshots in `screenshots/` folder
3. Run with `--headed` to see what's happening
4. Check `playwright-report/` for detailed traces
5. Review `LIVE_RPA_COMPREHENSIVE_PLANNING_ANSWERS.md` for troubleshooting

---

**Ready to test? Run this command:**

```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npx playwright test --headed
```

**Watch the magic happen!** 🎭✨


