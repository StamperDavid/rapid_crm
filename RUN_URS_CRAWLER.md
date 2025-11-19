# How to Run the URS Crawler

The URS crawler discovers all unique pages in the USDOT registration system by running through your 918 scenarios.

## Run the Crawler

```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npm run crawl-urs
```

This will:
- ✅ Open a visible Chrome browser window
- ✅ You can watch it fill forms, click buttons, navigate in real-time
- ✅ Runs random scenarios until all unique pages discovered
- ✅ Stops automatically after 10 scenarios with no new pages
- ✅ Saves all unique page HTML to `urs-crawler-output/unique-pages/`

## What You'll See

The browser will:
1. Authenticate to URS
2. Pick random scenarios from your 918 scenarios
3. Fill out complete applications with realistic data
4. Navigate all the way to the QR code screen
5. Track every unique page encountered
6. Repeat until confident all pages are found

## Output

Results saved in:
- `urs-crawler-output/unique-pages/` - All unique page HTML files
- `urs-crawler-output/unique-pages-tracker.json` - Complete page catalog

## When It's Done

Once you've discovered all pages (typically 50-100 runs), you can delete the crawler code if you want.

The captured pages will remain in the output directory for training your AI agents.

