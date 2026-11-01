import Link from 'next/link';
import Image from 'next/image';
import { READING_CTA_HREF } from '@/lib/seo/site';
import { TRIAL_DAYS } from '@/lib/onboarding/constants';
import { SERIF, BODY, UI, INDIGO, GOLD } from './tokens';

// Cream CTA card that sends content-page readers into the onboarding funnel.
export default function ReadingCta({ heading, body }: { heading: string; body: string }) {
  return (
    <aside
      style={{
        background: '#FAF7F0',
        borderRadius: '18px',
        border: `1px solid ${GOLD}`,
        padding: '28px 24px',
        margin: '48px 0',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Image
        src="/melissa/melissa-default.png"
        alt="Melissa, Vesper's tarot reader"
        width={84}
        height={84}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
      <div style={{ flex: '1 1 260px' }}>
        <p style={{ fontFamily: SERIF, fontSize: '24px', color: INDIGO, margin: '0 0 8px', lineHeight: 1.25 }}>{heading}</p>
        <p style={{ fontFamily: BODY, fontSize: '17px', color: 'rgba(30,18,86,0.72)', margin: '0 0 16px', lineHeight: 1.55 }}>{body}</p>
        <Link
          href={READING_CTA_HREF}
          style={{
            display: 'inline-block',
            background: GOLD,
            color: INDIGO,
            fontFamily: UI,
            fontSize: '15px',
            fontWeight: 500,
            padding: '12px 22px',
            borderRadius: '999px',
            textDecoration: 'none',
          }}
        >
          Start your free reading →
        </Link>
        <p style={{ fontFamily: UI, fontSize: '12px', color: 'rgba(30,18,86,0.55)', margin: '10px 0 0' }}>
          {TRIAL_DAYS} days free, then £9.99 a month. Cancel any time.
        </p>
      </div>
    </aside>
  );
}
