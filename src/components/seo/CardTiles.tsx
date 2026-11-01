import Image from 'next/image';
import Link from 'next/link';
import { getCardBySlug } from '@/lib/seo/cards';
import { UI, CREAM, GOLD, HAIRLINE } from './tokens';

// A labelled row of linked card images (zodiac sign cards, yes/no/wait cards on question pages).
export default function CardTiles({ label, slugs, size = 104 }: { label?: string; slugs: string[]; size?: number }) {
  const cards = slugs.map((s) => getCardBySlug(s)).filter((c) => c !== undefined);
  return (
    <div style={{ margin: '0 0 20px' }}>
      {label && (
        <p style={{ fontFamily: UI, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, margin: '0 0 10px' }}>
          {label}
        </p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {cards.map((c) => (
          <li key={c.slug} style={{ width: `${size}px` }}>
            <Link href={`/cards/${c.slug}`} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              <Image
                src={c.image}
                alt={`${c.name} tarot card`}
                width={size}
                height={Math.round(size * 1.875)}
                sizes={`${size}px`}
                style={{ width: '100%', height: 'auto', borderRadius: '8px', border: `1px solid ${HAIRLINE}` }}
              />
              <span style={{ display: 'block', fontFamily: UI, fontSize: '13px', color: CREAM, marginTop: '6px', lineHeight: 1.3 }}>{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
