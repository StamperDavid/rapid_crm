/**
 * Manual URS Page Capture
 * 
 * YOU navigate through URS manually.
 * Script automatically saves HTML of every page you visit.
 * Press SPACE to save current page.
 * Press ESC to finish.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

let pageCount = 0;
const outputDir = path.join(__dirname, '../urs-manual-capture');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function startManualCapture() {
  console.log('🚀 Starting Manual Page Capture...\n');
  console.log('📋 Instructions:');
  console.log('   1. Browser will open');
  console.log('   2. Login and navigate through URS manually');
  console.log('   3. Press SPACEBAR to save current page');
  console.log('   4. Press ESC when done');
  console.log('');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 0
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to URS
  await page.goto('https://portal.fmcsa.dot.gov/UrsRegistrationWizard/');

  console.log('✅ Browser opened');
  console.log('👉 Navigate manually, press SPACEBAR to save each page\n');

  // Listen for keyboard events
  await page.exposeFunction('savePage', async () => {
    pageCount++;
    const html = await page.content();
    const url = page.url();
    
    // Create filename from page count
    const filename = `page_${String(pageCount).padStart(3, '0')}.html`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, html, 'utf-8');
    
    console.log(`✅ Page ${pageCount} saved: ${filename}`);
    console.log(`   URL: ${url}`);
  });

  await page.exposeFunction('finishCapture', async () => {
    console.log(`\n🎉 Capture complete! ${pageCount} pages saved.`);
    console.log(`📁 Output: ${outputDir}`);
    await browser.close();
    process.exit(0);
  });

  // Add keyboard listener to the page
  await page.evaluate(() => {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        window.savePage();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        window.finishCapture();
      }
    });
  });

  // Keep script running
  await new Promise(() => {}); // Wait forever
}

startManualCapture().catch(console.error);

