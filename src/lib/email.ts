import { Resend } from 'resend';

// Thin wrapper around Resend for the daily check-in email. Mirrors the
// convention in src/lib/bedrock.ts: one small wrapper file, not scattered
// direct SDK calls across routes.

const FROM = 'Melissa at Vesper <melissa@vesper.cards>';
// CTA lands on /main (the post-trial menu: daily card, spreads, journal)
// rather than jumping straight into the daily reading.
const MAIN_URL = 'https://vesper.cards/main';

let client: Resend | null = null;

function getResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    client = new Resend(apiKey);
  }
  return client;
}

export interface CheckinRecipient {
  to: string;
  name?: string | null;
  unsubscribeUrl: string;
}

function subjectFor(name?: string | null): string {
  return name ? `Your card is waiting, ${name}` : 'Your card is waiting';
}

// Plain HTML, no React Email dependency (per project convention). Inline
// styles only, since most email clients strip <style> blocks anyway.
function htmlFor(name: string | null | undefined, unsubscribeUrl: string): string {
  const greeting = name ? `, ${name}` : '';
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background-color:#FAF7F0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F0;" bgcolor="#FAF7F0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr>
              <td style="padding-bottom:24px; text-align:center;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size:15px; letter-spacing:2px; text-transform:uppercase; color:#C9A84C;">Vesper</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 24px; background-color:#1E1256; border-radius:16px; text-align:center;" bgcolor="#1E1256">
                <p style="font-family: Georgia, 'Times New Roman', serif; font-size:22px; line-height:1.4; color:#FAF7F0; margin:0 0 16px; text-align:center;">
                  Good day${greeting}.
                </p>
                <p style="font-family: Georgia, 'Times New Roman', serif; font-size:16px; line-height:1.6; color:#FAF7F0; margin:0 0 16px; text-align:center;">
                  I've drawn your card for today, and I don't think it's one to leave sitting in the dark. There's something in it worth sitting with for a moment: a little clarity, maybe a little comfort.
                </p>
                <p style="font-family: Georgia, 'Times New Roman', serif; font-size:16px; line-height:1.6; color:#FAF7F0; margin:0 0 28px; text-align:center;">
                  Come find out what it is, when you're ready.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="border-radius:999px; background-color:#C9A84C;" bgcolor="#C9A84C">
                      <a href="${MAIN_URL}" style="display:inline-block; padding:14px 32px; font-family: Georgia, 'Times New Roman', serif; font-size:16px; font-weight:bold; color:#1E1256; text-decoration:none; border-radius:999px;">
                        See today's card
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 8px 0; text-align:center;">
                <p style="font-family: Georgia, 'Times New Roman', serif; font-size:12px; line-height:1.6; color:#1E1256; margin:0;">
                  Melissa, Vesper
                </p>
                <p style="font-family: Georgia, 'Times New Roman', serif; font-size:12px; line-height:1.6; color:#6B5F7A; margin:8px 0 0;">
                  You're getting this because you asked Melissa to check in.
                  <a href="${unsubscribeUrl}" style="color:#C9A84C;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function headersFor(unsubscribeUrl: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

export async function sendDailyCheckin({ to, name, unsubscribeUrl }: CheckinRecipient) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: subjectFor(name),
    html: htmlFor(name, unsubscribeUrl),
    headers: headersFor(unsubscribeUrl),
  });
}

// Resend's batch endpoint accepts up to 100 emails per call and does not
// support custom headers per historical versions of the SDK type defs in some
// releases, but the current resend SDK does pass `headers` through per item —
// keep it here so List-Unsubscribe still applies to batched sends.
export async function sendDailyCheckinBatch(recipients: CheckinRecipient[]) {
  const resend = getResend();
  const payload = recipients.map(({ to, name, unsubscribeUrl }) => ({
    from: FROM,
    to,
    subject: subjectFor(name),
    html: htmlFor(name, unsubscribeUrl),
    headers: headersFor(unsubscribeUrl),
  }));
  return resend.batch.send(payload);
}

export const RESEND_BATCH_CHUNK_SIZE = 100;
