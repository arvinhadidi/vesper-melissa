import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@/lib/unsubscribeToken';

// Public route (no session): reached from an email link, so it's authenticated
// purely by the HMAC token, not by cookies. GET handles the human click-through;
// POST handles the mailbox-provider one-click unsubscribe (RFC 8058), which is
// what List-Unsubscribe-Post: List-Unsubscribe=One-Click on the send triggers.

const INVALID_RESPONSE = 'This unsubscribe link is invalid or has expired.';

function confirmationHtml(): string {
  return `<!doctype html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0; padding:0; background-color:#120B3A; min-height:100vh;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#120B3A; min-height:100vh;">
      <tr>
        <td align="center" style="padding:80px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
            <tr>
              <td style="text-align:center; padding-bottom:20px;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size:15px; letter-spacing:2px; text-transform:uppercase; color:#C9A84C;">Vesper</span>
              </td>
            </tr>
            <tr>
              <td style="text-align:center; padding:32px 28px; background-color:#1E1256; border-radius:16px; border:1px solid rgba(201,168,76,0.3);">
                <p style="font-family: Georgia, 'Times New Roman', serif; font-size:20px; line-height:1.5; color:#FAF7F0; margin:0 0 12px;">
                  You won't get any more check-in emails.
                </p>
                <p style="font-family: Georgia, 'Times New Roman', serif; font-size:15px; line-height:1.6; color:rgba(250,247,240,0.75); margin:0 0 20px;">
                  Your reading is still there whenever you want it.
                </p>
                <a href="https://vesper.cards" style="font-family: Georgia, 'Times New Roman', serif; font-size:14px; color:#C9A84C; text-decoration:none;">
                  Back to Vesper
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function handleUnsubscribe(token: string | null): Promise<NextResponse> {
  const { valid, uid } = verifyUnsubscribeToken(token);

  if (!valid || !uid) {
    return new NextResponse(INVALID_RESPONSE, {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .upsert({ id: uid, email_opt_out: true }, { onConflict: 'id' });

  if (error) {
    console.error('[unsubscribe] failed to set email_opt_out', { uid, error: error.message });
    return new NextResponse('Something went wrong. Please try again.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse(confirmationHtml(), {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  return handleUnsubscribe(token);
}

// One-click unsubscribe (List-Unsubscribe-Post): mailbox providers POST here
// with no body we need to read — the token travels in the URL query string
// on both GET and POST since Resend/RFC 8058 only requires the URL be stable.
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  return handleUnsubscribe(token);
}
