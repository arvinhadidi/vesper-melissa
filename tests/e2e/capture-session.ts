import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const STORAGE_STATE_PATH = path.join(__dirname, 'storageState.json');
const TEST_USER_EMAIL = process.env.E2E_TEST_EMAIL || 'arvhadidi@gmail.com';

// Google blocks OAuth sign-in from CDP-controlled (Playwright/Puppeteer) browsers
// with "this browser or app may not be secure" — that's intentional anti-automation
// policy on Google's side, not something to work around. Instead, mint a real
// Supabase session for a designated test user via the Admin API (service role key,
// never exposed to the client) and apply it through the app's own
// supabase.auth.setSession() call at /test/auth-bridge — so the resulting cookies
// are produced by the real client code, identical to what a normal login writes.
async function main() {
  const envPath = path.join(__dirname, '../../.env.local');
  const env = fs.readFileSync(envPath, 'utf8');
  const supabaseUrl = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1].trim();
  const serviceRoleKey = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m)?.[1].trim();
  const anonKey = env.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)$/m)?.[1].trim();

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    throw new Error('Missing Supabase env vars in .env.local');
  }

  console.log(`Minting a session for ${TEST_USER_EMAIL} via the Admin API...`);
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: TEST_USER_EMAIL,
  });
  if (linkError || !linkData) {
    throw new Error(`generateLink failed: ${linkError?.message}`);
  }

  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: otpData, error: otpError } = await anonClient.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'email',
  });
  if (otpError || !otpData.session) {
    throw new Error(`verifyOtp failed: ${otpError?.message}`);
  }

  const { access_token, refresh_token } = otpData.session;
  console.log(`Session minted for user ${otpData.user?.id}.`);

  console.log('Launching headed browser to apply the session via the real app client...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const hash = new URLSearchParams({ access_token, refresh_token, next: '/main' });
  await page.goto(`${BASE_URL}/test/auth-bridge#${hash.toString()}`);

  await page.waitForFunction(
    () => !window.location.pathname.startsWith('/test/auth-bridge'),
    { timeout: 30000 },
  );

  console.log(`Landed on: ${page.url()}`);
  await page.waitForTimeout(1000);

  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log(`\nSaved session to ${STORAGE_STATE_PATH}`);

  await browser.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error('capture-session failed:', err);
  process.exit(1);
});
