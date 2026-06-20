import { test, expect, Page } from '@playwright/test';

test.use({ storageState: 'tests/e2e/storageState.json' });
// Generous overall budget: this runs against `next dev`, where each route compiles
// lazily on first visit and can add many seconds per onboarding step.
test.setTimeout(15 * 60 * 1000);

// Clicks the first visible OptionTile-style button on the page and waits for the
// app to navigate to the next onboarding step. Most OptionTile screens auto-advance
// 300ms after a click (see e.g. src/app/onboarding/mood/page.tsx), so which option
// gets picked doesn't matter for a happy-path test.
async function pickFirstOptionAndAdvance(page: Page, nextUrlPattern: RegExp) {
  await page.locator('button').first().click();
  await page.waitForURL(nextUrlPattern, { timeout: 40000 });
}

async function clickButtonAndAdvance(page: Page, name: string | RegExp, nextUrlPattern: RegExp) {
  await page.getByRole('button', { name }).click();
  await page.waitForURL(nextUrlPattern, { timeout: 20000 });
}

test('happy path: onboarding -> paywall -> checkout -> reading -> cancel -> delete', async ({ page }) => {
  await test.step('onboarding: welcome -> disclaimer', async () => {
    await page.goto('/onboarding/welcome');
    await clickButtonAndAdvance(page, "Let's begin", /\/onboarding\/disclaimer/);
  });

  await test.step('onboarding: skip disclaimer (test session already authenticated; the real "I\'m ready" button re-triggers Google OAuth, which is blocked for automated browsers)', async () => {
    await page.goto('/onboarding/name');
  });

  await test.step('onboarding: name', async () => {
    await page.getByPlaceholder('your name...').fill('Tess');
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/star-sign/);
  });

  await test.step('onboarding: star-sign', async () => {
    await page.locator('button').first().click(); // first zodiac glyph
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/mood/);
  });

  await test.step('onboarding: mood -> notices-signs', async () => {
    await pickFirstOptionAndAdvance(page, /\/onboarding\/notices-signs/);
  });

  await test.step('onboarding: notices-signs -> focus-area', async () => {
    await pickFirstOptionAndAdvance(page, /\/onboarding\/focus-area/);
  });

  await test.step('onboarding: focus-area -> interstitial-focus', async () => {
    await pickFirstOptionAndAdvance(page, /\/onboarding\/interstitial-focus/);
  });

  await test.step('onboarding: interstitial-focus -> privacy (auto-advance)', async () => {
    await page.waitForURL(/\/onboarding\/privacy/, { timeout: 30000 });
  });

  await test.step('onboarding: privacy -> situation', async () => {
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/situation/);
  });

  await test.step('onboarding: situation -> specific-person', async () => {
    await pickFirstOptionAndAdvance(page, /\/onboarding\/specific-person/);
  });

  await test.step('onboarding: specific-person -> micro-pull', async () => {
    await pickFirstOptionAndAdvance(page, /\/onboarding\/micro-pull/);
  });

  await test.step('onboarding: micro-pull -> duration', async () => {
    await page.getByAltText('Card deck').click();
    // Continue only renders once the per-character typewriter line finishes (~22ms/char).
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout: 10000 });
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/duration/);
  });

  await test.step('onboarding: duration -> reading-intent', async () => {
    await pickFirstOptionAndAdvance(page, /\/onboarding\/reading-intent/);
  });

  await test.step('onboarding: reading-intent -> gut-feeling', async () => {
    await page.locator('button').first().click(); // toggle first option (multiselect)
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/gut-feeling/);
  });

  await test.step('onboarding: gut-feeling -> stat', async () => {
    await pickFirstOptionAndAdvance(page, /\/onboarding\/stat/);
  });

  await test.step('onboarding: stat -> commitment', async () => {
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/commitment/);
  });

  await test.step('onboarding: commitment -> email-checkin', async () => {
    await clickButtonAndAdvance(page, 'I can do that.', /\/onboarding\/email-checkin/);
  });

  await test.step('onboarding: email-checkin -> synthesis (defaults already valid)', async () => {
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/synthesis/);
  });

  await test.step('onboarding: synthesis -> social-proof (auto-advance, ~14s)', async () => {
    await page.waitForURL(/\/onboarding\/social-proof/, { timeout: 45000 });
  });

  await test.step('onboarding: social-proof -> trial-enabled', async () => {
    await clickButtonAndAdvance(page, 'Continue', /\/onboarding\/trial-enabled/);
  });

  await test.step('onboarding: trial-enabled -> paywall (auto-advance)', async () => {
    await page.waitForURL(/\/onboarding\/paywall/, { timeout: 30000 });
  });

  await test.step('paywall: start trial -> redirected to Stripe Checkout', async () => {
    await page.getByRole('button', { name: /Try Vesper for/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
  });

  await test.step('Stripe Checkout: pay with test card 4242', async () => {
    // The email is pre-filled (read-only) since we passed it to Stripe server-side.
    // The "Card" row's own radio click target is covered by an invisible accordion
    // toggle layer, so a normal click never registers — force it to bypass the
    // actionability/visibility check and dispatch the click directly.
    await page.getByRole('radio', { name: 'Card' }).click({ force: true });

    await page.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242');
    await page.getByPlaceholder('MM / YY').fill('12/34');
    await page.getByPlaceholder('CVC').fill('123');
    await page.getByPlaceholder('Full name on card').fill('Tess Test');

    await page.getByRole('button', { name: 'Start trial' }).click();
    await page.waitForURL(/\/personalisation/, { timeout: 30000 });
  });

  await test.step('personalisation -> lands in app (full reconcile + tour setup)', async () => {
    await page.waitForURL(/\/main|\/daily/, { timeout: 30000 });
  });

  await test.step('generate a daily reading', async () => {
    await page.goto('/daily');
    await page.locator('img[src*="card-back"]').click();
    await page.getByRole('button', { name: "Get Melissa's take" }).click();
    await page.waitForURL(/\/daily\/daily-\d{4}-\d{2}-\d{2}/, { timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Carry on the conversation' })).toBeVisible({ timeout: 30000 });
  });

  await test.step('cancel subscription via Stripe billing portal', async () => {
    await page.goto('/account');
    await page.getByRole('button', { name: 'Manage subscription' }).click();
    await page.waitForURL(/billing\.stripe\.com/, { timeout: 15000 });

    await page.getByRole('button', { name: /Cancel plan|Cancel subscription/ }).click();
    const confirm = page.getByRole('button', { name: /^Cancel plan$|Yes, cancel|Confirm/ });
    if (await confirm.count() > 0) {
      await confirm.first().click();
    }

    await page.getByRole('link', { name: /Return|Back/ }).click();
    await page.waitForURL(/\/account/, { timeout: 15000 });
  });

  await test.step('delete account', async () => {
    await page.getByRole('button', { name: 'Delete account' }).click();
    await page.getByRole('button', { name: 'Yes, delete my account' }).click();
    await page.waitForURL('/', { timeout: 15000 });
  });
});
