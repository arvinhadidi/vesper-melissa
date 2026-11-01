import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { SERIF, BODY, UI, CREAM, GOLD, MUTED } from './tokens';

// Server-rendered Markdown for the guides. Internal links use next/link for prefetching.
const components: Components = {
  h2: ({ children }) => (
    <h2 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: 400, color: CREAM, margin: '44px 0 14px', lineHeight: 1.25 }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: UI, fontSize: '17px', fontWeight: 500, color: GOLD, margin: '28px 0 8px' }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily: BODY, fontSize: '19px', color: MUTED, lineHeight: 1.7, margin: '0 0 18px' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ fontFamily: BODY, fontSize: '19px', color: MUTED, lineHeight: 1.6, margin: '0 0 18px', paddingLeft: '22px' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ fontFamily: BODY, fontSize: '19px', color: MUTED, lineHeight: 1.6, margin: '0 0 18px', paddingLeft: '24px' }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ margin: '0 0 8px' }}>{children}</li>,
  strong: ({ children }) => <strong style={{ color: CREAM, fontWeight: 600 }}>{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: `2px solid ${GOLD}`, margin: '0 0 18px', padding: '2px 0 2px 18px' }}>{children}</blockquote>
  ),
  a: ({ href, children }) => {
    const style = { color: GOLD, textDecoration: 'underline', textUnderlineOffset: '3px' } as const;
    return href && href.startsWith('/') ? (
      <Link href={href} style={style}>{children}</Link>
    ) : (
      <a href={href} style={style} rel="noopener">{children}</a>
    );
  },
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0 0 22px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '15px' }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid ${GOLD}`, color: GOLD, fontWeight: 500 }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(250,247,240,0.12)', color: MUTED, verticalAlign: 'top' }}>{children}</td>
  ),
};

export default function Prose({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
