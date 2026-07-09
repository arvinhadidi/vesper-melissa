import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendDailyCheckin, sendDailyCheckinBatch, RESEND_BATCH_CHUNK_SIZE } from '@/lib/email';
import { buildUnsubscribeUrl } from '@/lib/unsubscribeToken';

// Runs hourly via GitHub Actions (.github/workflows/daily-checkin-cron.yml,
// Vercel Hobby crons are daily-only). Each run figures out which of the four
// preferred_checkin_time buckets the current hour falls into for
// Europe/London, then emails everyone in that bucket who hasn't already been
// emailed in the last 20 hours.
//
// KNOWN LIMITATION: no per-user timezone is stored (see CLAUDE.md). A US-based
// "morning" user gets an email timed to UK morning, not their own — acceptable
// for now since the audience is UK/US and the alternative is not sending
// anything at all. Revisit once timezone is captured (e.g. from browser Intl
// at signup) rather than assuming Europe/London for everyone.

const PRODUCTION_URL = 'https://vesper.cards';
const STALE_AFTER_MS = 20 * 60 * 60 * 1000; // 20 hours

type CheckinBucket = 'morning' | 'lunchtime' | 'evening' | 'night';

function currentLondonHour(): number {
  const hourStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: 'numeric',
    hour12: false,
  }).format(new Date());
  // Intl can return "24" for midnight in some environments; normalize to 0.
  return Number(hourStr) % 24;
}

function bucketForHour(hour: number): CheckinBucket | null {
  if (hour === 7 || hour === 8) return 'morning';
  if (hour === 12 || hour === 13) return 'lunchtime';
  if (hour === 18 || hour === 19) return 'evening';
  if (hour === 21 || hour === 22) return 'night';
  return null;
}

interface CandidateProfile {
  id: string;
  display_name: string | null;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1';
  const dryRunTo = req.nextUrl.searchParams.get('to');

  if (dryRun) {
    if (!dryRunTo) {
      return NextResponse.json({ error: 'dryRun=1 requires a `to` query param' }, { status: 400 });
    }
    const dryRunName = req.nextUrl.searchParams.get('name') || 'there';
    // Bogus (but well-formed) token: exercises the real template/send path
    // without granting a working unsubscribe link tied to a real account.
    const previewUnsubscribeUrl = `${PRODUCTION_URL}/api/email/unsubscribe?token=dry-run-preview.0000000000000000000000000000000000000000000000000000000000000000`;
    try {
      const result = await sendDailyCheckin({
        to: dryRunTo,
        name: dryRunName,
        unsubscribeUrl: previewUnsubscribeUrl,
      });
      return NextResponse.json({ dryRun: true, attempted: 1, sent: 1, failed: 0, result });
    } catch (err) {
      console.error('[cron/daily-checkin] dry run send failed', err);
      return NextResponse.json({ dryRun: true, attempted: 1, sent: 0, failed: 1 }, { status: 500 });
    }
  }

  const hour = currentLondonHour();
  const bucket = bucketForHour(hour);

  if (!bucket) {
    return NextResponse.json({ attempted: 0, sent: 0, failed: 0, reason: 'no bucket for current hour', hour });
  }

  const staleCutoff = new Date(Date.now() - STALE_AFTER_MS).toISOString();

  const { data: candidates, error: queryError } = await supabaseAdmin
    .from('user_profiles')
    .select('id, display_name')
    .eq('subscription_status', 'active')
    .eq('email_marketing_consent', true)
    .eq('email_opt_out', false)
    .eq('preferred_checkin_time', bucket)
    .or(`last_checkin_email_sent_at.is.null,last_checkin_email_sent_at.lt.${staleCutoff}`);

  if (queryError) {
    console.error('[cron/daily-checkin] failed to query candidates', queryError.message);
    return NextResponse.json({ error: 'Failed to query candidates' }, { status: 500 });
  }

  const profiles = (candidates ?? []) as CandidateProfile[];

  if (profiles.length === 0) {
    return NextResponse.json({ attempted: 0, sent: 0, failed: 0, bucket });
  }

  // user_profiles has no email column — look each one up via the auth admin
  // API. Fine at current user volumes; if this becomes a bottleneck, mirror
  // email onto user_profiles at signup instead.
  const withEmails = await Promise.all(
    profiles.map(async profile => {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        if (error || !data?.user?.email) return null;
        return { id: profile.id, name: profile.display_name, email: data.user.email };
      } catch (err) {
        console.error('[cron/daily-checkin] failed to look up email', { uid: profile.id, err });
        return null;
      }
    }),
  );

  const recipients = withEmails.filter((r): r is { id: string; name: string | null; email: string } => r !== null);

  let attempted = 0;
  let sent = 0;
  let failed = 0;
  const sentIds: string[] = [];

  for (const batch of chunk(recipients, RESEND_BATCH_CHUNK_SIZE)) {
    attempted += batch.length;
    try {
      const payload = batch.map(r => ({
        to: r.email,
        name: r.name,
        unsubscribeUrl: buildUnsubscribeUrl(r.id, PRODUCTION_URL),
      }));
      const result = await sendDailyCheckinBatch(payload);
      if (result.error) {
        console.error('[cron/daily-checkin] batch send failed', result.error);
        failed += batch.length;
        continue;
      }
      sent += batch.length;
      sentIds.push(...batch.map(r => r.id));
    } catch (err) {
      console.error('[cron/daily-checkin] batch send threw', err);
      failed += batch.length;
    }
  }

  if (sentIds.length > 0) {
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(sentIds.map(id => ({ id, last_checkin_email_sent_at: now })), { onConflict: 'id' });
    if (updateError) {
      console.error('[cron/daily-checkin] failed to update last_checkin_email_sent_at', updateError.message);
    }
  }

  return NextResponse.json({ attempted, sent, failed, bucket });
}
