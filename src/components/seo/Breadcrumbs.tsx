import Link from 'next/link';
import JsonLd from './JsonLd';
import { absoluteUrl } from '@/lib/seo/site';
import { UI, FAINT, GOLD } from './tokens';

export interface Crumb {
  name: string;
  href: string;
}

// Visible breadcrumb trail + matching BreadcrumbList JSON-LD.
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" style={{ fontFamily: UI, fontSize: '13px', color: FAINT, margin: '0 0 20px' }}>
        {items.map((c, i) => (
          <span key={c.href}>
            {i > 0 && <span style={{ margin: '0 8px' }}>/</span>}
            {i < items.length - 1 ? (
              <Link href={c.href} style={{ color: GOLD, textDecoration: 'none' }}>{c.name}</Link>
            ) : (
              <span aria-current="page">{c.name}</span>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.href),
          })),
        }}
      />
    </>
  );
}
