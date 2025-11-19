# Manual URS Page Capture

Quick, reliable way to capture all URS pages - YOU navigate, script saves automatically.

## Run It

```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
node scripts/manual-page-capture.js
```

## How It Works

1. **Browser opens** to URS
2. **You manually navigate** through the application
   - Login with Login.gov
   - Fill out forms however you want
   - Click through pages naturally
3. **Press SPACEBAR** on each page to save it
4. **Press ESC** when done

## Output

All pages saved to:
```
urs-manual-capture/
  page_001.html
  page_002.html
  page_003.html
  ...
```

## To Get ALL Unique Pages

Run through different scenarios:
1. **Run 1:** Third Party YES → Hazmat YES
2. **Run 2:** Third Party NO → Hazmat YES  
3. **Run 3:** Third Party NO → Hazmat NO → HHG
4. **Run 4:** Private carrier
5. Etc.

Each run, just press SPACEBAR on every new page you see.

## Advantages

✅ **100% reliable** - no automation failures
✅ **You control it** - navigate however you want
✅ **Fast** - takes 10 minutes per scenario
✅ **Complete** - you see every page, guarantee you got them all
✅ **No debugging** - if you can see it, it gets saved

Takes maybe 2 hours to manually run through 10-15 scenarios and capture everything.

Way faster than debugging the crawler.

