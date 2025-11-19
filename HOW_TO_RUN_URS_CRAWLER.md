# 🚀 How to Run the URS Crawler from Your Dashboard

## Quick Start

### 1. Start Your Servers

**Terminal 1 - Backend:**
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npm run dev:server
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM
npm run dev
```

### 2. Access the Crawler

1. Open your browser to **http://localhost:5173**
2. Look in the left sidebar for **"URS Crawler"** (purple/indigo icon)
3. Click it!

### 3. Run the Crawler

1. Click the big green **"Start Crawler"** button
2. Watch the magic happen! You'll see:
   - **Live stats** updating every 2 seconds
   - **Unique pages found** counter
   - **Scenarios run** counter
   - **Live logs** showing exactly what's happening
   - **Progress indicator** (X/10 scenarios without new pages)

### 4. What Happens

The crawler will:
- ✅ Load all 918 scenarios from your database
- ✅ Pick random scenarios and run them
- ✅ Fill out the ENTIRE URS application with realistic data
- ✅ Track every unique page it discovers
- ✅ Keep running until it's 100% sure it found all pages (10 scenarios in a row with no new pages)
- ✅ Stop automatically when done

## Results

All unique pages are saved in:
```
C:\Users\David\PycharmProjects\Rapid_CRM\urs-crawler-output\unique-pages\
```

Each file is named: `unique_page_XX_XXXXXXXX.html`

## Stopping the Crawler

Click the red **"Stop Crawler"** button at any time.

## What Makes This Special

### OLD way (what we had before):
- Run 6 hardcoded paths
- Stop after those 6 paths
- Might miss pages

### NEW way (what you have now):
- Randomly picks scenarios from your 918 scenarios
- Runs each all the way to the QR code screen
- Tracks EVERY unique page
- Won't stop until confident it found them all
- Uses REAL business data that passes validation

## Under the Hood

### The crawler now:

1. **Loads 918 scenarios** from `alex_training_scenarios` table
2. **Randomly selects** a scenario (diverse sample each time)
3. **Fills the ENTIRE form** with realistic data:
   - Company names, addresses, phone numbers
   - EIN, SSN, insurance info
   - All fields needed to pass URS validation
4. **Navigates all the way to QR code screen**
5. **Records every unique page** by generating a hash of its structure
6. **Repeats** until 10 scenarios in a row find no new pages
7. **Stops automatically** when done

### What gets saved:
- ✅ Complete HTML of every unique page
- ✅ Tracker JSON with all page metadata
- ✅ Field mapping for each page
- ✅ Question IDs extracted from each page

## Troubleshooting

### "Crawler is already running"
- Only one crawler can run at a time
- Stop the current one first

### "No scenarios found"
- Make sure your database has the 918 scenarios
- Check: `SELECT COUNT(*) FROM alex_training_scenarios`

### Can't see the button
- Make sure you're logged in as admin
- The button is in the admin toolbar (left sidebar)

## Example Run

```
🚀 SCENARIO RUN #1
Selected: For-hire Interstate Hazmat
✨ Found 25 new unique pages!

🚀 SCENARIO RUN #2
Selected: Private Intrastate No Hazmat
✨ Found 8 new unique pages! (Total: 33)

🚀 SCENARIO RUN #3
Selected: For-hire Interstate HHG
✨ Found 3 new unique pages! (Total: 36)

...

🚀 SCENARIO RUN #47
Selected: Random scenario
⚠️ No new pages found (1/10)

🚀 SCENARIO RUN #56
Selected: Random scenario
⚠️ No new pages found (10/10)

🎉 DISCOVERY COMPLETE!
Total Unique Pages: 127
Scenarios Run: 56
```

## Next Steps

Once you've discovered all pages, you can:
1. Train your AI agents with the complete page data
2. Delete the crawler (as you mentioned)
3. Use the captured pages for form filling automation

---

**That's it!** The crawler is now accessible from your dashboard with a single click. 🎉

