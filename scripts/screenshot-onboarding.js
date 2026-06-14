const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'onboarding');
const BASE_URL = 'http://localhost:3000/onboarding';
const VIEWPORT = { width: 390, height: 844 };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  let screenNum = 0;

  async function screenshot(label) {
    screenNum++;
    const filename = `screen-${screenNum}.png`;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });
    console.log(`  ✓ ${filename} — ${label}`);
  }

  async function wait(ms = 700) {
    await page.waitForTimeout(ms);
  }

  try {
    console.log('Navigating to onboarding...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await wait(1000);

    // Screen 1: Welcome
    await screenshot('welcome');
    await page.getByRole('button', { name: "Let's begin" }).click();
    await wait();

    // Screen 2: Disclaimer
    await screenshot('disclaimer');
    await page.getByRole('button', { name: "I'm ready" }).click();
    await wait();

    // Screen 3: Name
    await screenshot('name');
    await page.locator('input[type="text"]').fill('Maya');
    await wait(300);
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait();

    // Screen 4: Star sign
    await screenshot('star_sign');
    // Click "I don't know" to open date picker
    await page.locator('button:has-text("I don\'t know")').click();
    await wait(400);
    // Select day 15 and month June
    await page.locator('select').first().selectOption('15');
    await page.locator('select').last().selectOption('6');
    await wait(500);
    await screenshot('star_sign_with_picker');
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait();

    // Screen 5: Mood (auto-advances on tile click)
    await screenshot('mood');
    // Click first tile option
    await page.locator('button:has-text("Heavy")').click();
    await wait(600);

    // Screen 6: Notices signs (auto-advances)
    await screenshot('notices_signs');
    await page.locator('button:has-text("Always")').click();
    await wait(600);

    // Screen 7: Focus area (auto-advances) — click Love & Relationships
    await screenshot('focus_area');
    await page.locator('button:has-text("Love & Relationships")').click();
    await wait(600);

    // Screen 8: Interstitial focus (auto-advances after 3600ms)
    await screenshot('interstitial_focus');
    await wait(4000);

    // Screen 9: Privacy
    await screenshot('privacy');
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait();

    // Screen 10: Situation (love variant, auto-advances)
    await screenshot('situation');
    await page.locator('button:has-text("Single")').click();
    await wait(600);

    // Screen 11: Specific person (auto-advances)
    await screenshot('specific_person');
    await page.locator('button:has-text("Yes, there\'s someone")').click();
    await wait(600);

    // Screen 12: Hold in mind (auto-advances after 4200ms)
    await screenshot('hold_in_mind');
    await wait(4600);

    // Screen 13: Micro pull — tap the card
    await screenshot('micro_pull');
    // Click the card deck area
    await page.locator('[style*="perspective"]').first().click();
    await wait(4000); // wait for typewriter to finish
    await screenshot('micro_pull_revealed');
    // Click continue after card reveals
    try {
      await page.getByRole('button', { name: 'Continue' }).click({ timeout: 3000 });
    } catch {
      // If continue button not visible yet, wait more
      await wait(2000);
      await page.getByRole('button', { name: 'Continue' }).click();
    }
    await wait();

    // Screen 14: Duration (auto-advances)
    await screenshot('duration');
    await page.locator('button:has-text("Just recently")').click();
    await wait(600);

    // Screen 15: Reading intent — pick 2
    await screenshot('reading_intent');
    await page.locator('button:has-text("Clarity")').click();
    await wait(300);
    await page.locator('button:has-text("A Sign")').click();
    await wait(300);
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait();

    // Screen 16: Gut feeling (auto-advances)
    await screenshot('gut_feeling');
    await page.locator('button:has-text("That it\'s going to work out")').click();
    await wait(600);

    // Screen 17: Stat
    await screenshot('stat');
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait();

    // Screen 18: Commitment
    await screenshot('commitment');
    await page.getByRole('button', { name: 'I can do that.' }).click();
    await wait();

    // Screen 19: Email checkin
    await screenshot('email_checkin');
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait();

    // Screen 20: Synthesis (auto-advances after ~12s)
    await screenshot('synthesis');
    await wait(14000);

    // Screen 21: Social proof
    await screenshot('social_proof');
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait();

    // Screen 22: Trial enabled (auto-advances after 2500ms)
    await screenshot('trial_enabled');
    await wait(3000);

    // Screen 23: Paywall
    await screenshot('paywall');

    console.log(`\nDone! ${screenNum} screenshots saved to screenshots/onboarding/`);
  } catch (err) {
    console.error(`\n✗ Error at screen-${screenNum + 1}:`, err.message);
    await screenshot(`ERROR_${err.message.slice(0, 40)}`);
  } finally {
    await browser.close();
  }
}

run();
