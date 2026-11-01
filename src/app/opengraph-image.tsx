import { ImageResponse } from 'next/og';

// Default social share card for every route that doesn't set its own (card pages use the card art).
export const alt = 'Vesper: tarot readings with Melissa, your personal oracle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #1E1256 0%, #120B3A 100%)',
          color: '#FAF7F0',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 120, letterSpacing: 2 }}>Vesper</div>
        <div style={{ fontSize: 40, color: '#C9A84C', marginTop: 16 }}>What the cards have been trying to tell you</div>
        <div style={{ fontSize: 28, color: 'rgba(250,247,240,0.7)', marginTop: 40 }}>
          Daily tarot readings and spreads with Melissa · vesper.cards
        </div>
      </div>
    ),
    size,
  );
}
