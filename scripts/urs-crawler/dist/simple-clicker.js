"use strict";
/**
 * SIMPLE CLICKER - No fancy logic, just click stuff
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleClicker = void 0;
class SimpleClicker {
    constructor(page) {
        this.page = page;
    }
    /**
     * Fill form - click first radio button in each group
     */
    async fillForm() {
        console.log('   → Filling form (simple approach)...');
        // Get all radio button groups
        const radioNames = new Set();
        const allRadios = await this.page.$$('input[type="radio"]');
        for (const radio of allRadios) {
            const name = await radio.getAttribute('name');
            if (name) {
                radioNames.add(name);
            }
        }
        // Click first radio in each group
        for (const name of radioNames) {
            try {
                const firstRadio = await this.page.$(`input[type="radio"][name="${name}"]`);
                if (firstRadio) {
                    console.log(`      → Clicking radio: ${name}`);
                    await firstRadio.click({ force: true });
                    await this.page.waitForTimeout(500);
                }
            }
            catch (e) {
                continue;
            }
        }
        // Wait for validation
        await this.page.waitForTimeout(2000);
    }
    /**
     * Click next - try EVERYTHING
     */
    async clickNext() {
        console.log('   → Trying to click Next...');
        const urlBefore = this.page.url();
        // Method 0: Look for the yellow NEXT button specifically (URS sidebar)
        console.log('      → Method 0: Looking for yellow NEXT button...');
        try {
            // The NEXT button in URS is typically in sidebar with specific styling
            const nextButton = await this.page.locator('text=NEXT').first();
            if (await nextButton.count() > 0) {
                console.log('         → Found NEXT text, clicking...');
                await nextButton.click({ force: true, timeout: 3000 });
                await this.page.waitForTimeout(2000);
                if (this.page.url() !== urlBefore) {
                    console.log('   ✅ Yellow NEXT button worked!');
                    return true;
                }
            }
        }
        catch (e) {
            console.log('      → NEXT locator failed, trying other methods...');
        }
        // Method 1: Try pressing Enter key (often submits forms)
        console.log('      → Method 1: Pressing Enter key...');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000);
        if (this.page.url() !== urlBefore) {
            console.log('   ✅ Enter key worked!');
            return true;
        }
        // Method 2: Find and click submit button with force
        console.log('      → Method 2: Force-clicking submit buttons...');
        const submitButtons = await this.page.$$('input[type="submit"], button[type="submit"]');
        for (const btn of submitButtons) {
            try {
                const value = await btn.getAttribute('value').catch(() => '');
                if (value && !value.includes('LOGIN.GOV')) {
                    console.log(`         → Trying: "${value}"`);
                    await btn.click({ force: true });
                    await this.page.waitForTimeout(2000);
                    if (this.page.url() !== urlBefore) {
                        console.log(`   ✅ Clicked "${value}"!`);
                        return true;
                    }
                }
                // Also try empty value buttons
                if (!value) {
                    console.log(`         → Trying empty-value button...`);
                    await btn.click({ force: true });
                    await this.page.waitForTimeout(2000);
                    if (this.page.url() !== urlBefore) {
                        console.log(`   ✅ Empty button worked!`);
                        return true;
                    }
                }
            }
            catch (e) {
                continue;
            }
        }
        // Method 3: Use locator (more modern Playwright API)
        console.log('      → Method 3: Using Playwright locator...');
        try {
            await this.page.locator('input[type="submit"]').first().click({ force: true, timeout: 5000 });
            await this.page.waitForTimeout(2000);
            if (this.page.url() !== urlBefore) {
                console.log('   ✅ Locator worked!');
                return true;
            }
        }
        catch (e) {
            console.log('      → Locator failed');
        }
        // Method 4: Execute JavaScript click on ALL buttons
        console.log('      → Method 4: JavaScript click on all buttons...');
        await this.page.evaluate(() => {
            const buttons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
            buttons.forEach((btn) => {
                try {
                    btn.click();
                }
                catch (e) { }
            });
        });
        await this.page.waitForTimeout(2000);
        if (this.page.url() !== urlBefore) {
            console.log('   ✅ JavaScript mass-click worked!');
            return true;
        }
        console.log('   ❌ All methods failed');
        return false;
    }
}
exports.SimpleClicker = SimpleClicker;
