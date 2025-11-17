# RPA Playwright Tests

## Overview

These tests verify browser automation capabilities for USDOT filing using Playwright.

## Test Categories

### 1. Basic Navigation Tests (`basic-navigation.spec.ts`)
- **READ-ONLY** - No applications submitted
- Tests browser automation is working
- Verifies FMCSA website accessibility
- Detects Login.gov integration
- Validates screenshot and interaction capabilities

### 2. Rate Limiting Tests
- Ensures delays between actions
- Prevents FMCSA rate limiting/blocking
- Validates respectful automation behavior

## Running Tests

### Run All Tests
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npx playwright test
```

### Run Specific Test File
```powershell
npx playwright test tests/rpa/basic-navigation.spec.ts
```

### Run with UI (Watch Mode)
```powershell
npx playwright test --ui
```

### Run Headed (Show Browser)
```powershell
npx playwright test --headed
```

### Debug Mode
```powershell
npx playwright test --debug
```

## Screenshots

Tests automatically save screenshots to `screenshots/` folder:
- `fmcsa-homepage.png` - FMCSA homepage
- `urs-portal.png` - URS portal page
- `login-detection.png` - Login.gov detection
- `automation-test.png` - Automation capability test

## Test Reports

After running tests, view the HTML report:
```powershell
npx playwright show-report
```

## Important Notes

### ⚠️ Safety First
- These are **READ-ONLY** tests
- **DO NOT** submit real applications in tests
- Always use test data
- Respect FMCSA rate limits

### Rate Limiting Configuration
- Max concurrent: 5 instances
- Delay between actions: 800ms
- Delay between pages: 2 seconds
- Random jitter: ±300ms

### Test Environment
- Browser: Chromium (headless=false for debugging)
- Viewport: 1920x1080
- User Agent: Chrome on Windows 10
- Screenshots: On failure
- Videos: On failure
- Traces: On failure

## Troubleshooting

### Test Fails to Load Page
- Check internet connection
- Verify FMCSA website is up
- Check firewall/proxy settings

### Browser Doesn't Launch
```powershell
# Reinstall browsers
npx playwright install chromium
```

### Timeout Errors
- Increase timeout in `playwright.config.ts`
- Check if website is slow
- Verify network stability

## Next Steps

After basic tests pass:
1. ✅ Create Login.gov authentication test
2. ✅ Test form field detection
3. ✅ Test form filling (simulated)
4. ✅ Build LiveUSDOTRPAService
5. ✅ Test complete filing workflow (test data only)

## Contact

For issues or questions, review:
- `LIVE_RPA_COMPREHENSIVE_PLANNING_ANSWERS.md`
- `IMPLEMENTATION_COMPLETE_SUMMARY.md`

