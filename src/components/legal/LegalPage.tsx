import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// Shared styled renderer for the long-form legal pages (/privacy, /terms). Server component:
// the markdown is parsed and rendered to HTML at build time, so there is no client-side JS or
// markdown bundle shipped. Styling matches the brand tokens (cream-on-indigo, gold accents,
// DM Serif headings, EB Garamond body) per the inline-style convention in CLAUDE.md.

const SERIF = 'var(--font-dm-serif-var), serif';
const BODY = 'var(--font-garamond-var), serif';
const UI = 'var(--font-dm-sans-var), sans-serif';
const CREAM = '#FAF7F0';
const GOLD = '#C9A84C';
const MUTED = 'rgba(250,247,240,0.7)';

const components: Components = {
  h1: ({ children }) => (
    <h1 style={{ fontFamily: SERIF, fontSize: '38px', fontWeight: 400, color: CREAM, margin: '0 0 24px', lineHeight: 1.2 }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 400, color: CREAM, margin: '40px 0 12px', lineHeight: 1.3 }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: UI, fontSize: '16px', fontWeight: 600, color: GOLD, margin: '24px 0 8px', letterSpacing: '0.01em' }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily: BODY, fontSize: '17px', color: MUTED, lineHeight: 1.65, margin: '0 0 16px' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ fontFamily: BODY, fontSize: '17px', color: MUTED, lineHeight: 1.6, margin: '0 0 16px', paddingLeft: '22px' }}>{children}</ul>
  ),
  li: ({ children }) => <li style={{ margin: '0 0 6px' }}>{children}</li>,
  strong: ({ children }) => <strong style={{ color: CREAM, fontWeight: 600 }}>{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} style={{ color: GOLD, textDecoration: 'underline', textUnderlineOffset: '2px' }}>{children}</a>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(201,168,76,0.25)', margin: '32px 0' }} />,
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0 0 20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '14px' }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid ${GOLD}`, color: GOLD, fontWeight: 600 }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(250,247,240,0.12)', color: MUTED, verticalAlign: 'top' }}>{children}</td>
  ),
};

export default function LegalPage({ markdown }: { markdown: string }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(to bottom, #1E1256 0%, #15103A 100%)',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 96px' }}>
        <Link href="/" style={{ fontFamily: UI, fontSize: '14px', color: GOLD, textDecoration: 'none', display: 'inline-block', marginBottom: '32px' }}>
          ← Back to Vesper
        </Link>
        <article>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
