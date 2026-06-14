import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TarotCard from '@/components/tarot/TarotCard';
import { getCardByNameShort } from '@/lib/cards';

describe('TarotCard', () => {
  const card = getCardByNameShort('ar00');

  it('should render without crashing', () => {
    render(<TarotCard card={card} size="md" />);
    // card-back img is always visible (front is hidden behind rotateY)
    const imgs = document.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
  });

  it('should render with all size variants', () => {
    const { rerender } = render(<TarotCard card={card} size="sm" />);
    expect(document.querySelectorAll('img').length).toBeGreaterThan(0);

    rerender(<TarotCard card={card} size="md" />);
    expect(document.querySelectorAll('img').length).toBeGreaterThan(0);

    rerender(<TarotCard card={card} size="lg" />);
    expect(document.querySelectorAll('img').length).toBeGreaterThan(0);
  });

  it('should render null card gracefully — no card face image', () => {
    const { container } = render(<TarotCard card={null} size="md" isFlipped />);
    // no card face img rendered when card=null
    const cardFaceDiv = container.querySelectorAll('img');
    // only the card-back img is present (card front has no img)
    expect(cardFaceDiv.length).toBe(1);
  });

  it('should call onFlip when clicked', () => {
    const mockFlip = vi.fn();
    const { container } = render(
      <TarotCard card={card} size="md" onFlip={mockFlip} isFlipped={false} />
    );
    const cardDiv = container.querySelector('[style*="perspective"]') as HTMLElement;
    cardDiv?.click();
    expect(mockFlip).toHaveBeenCalled();
  });

  it('should call onFlip on click regardless of flipped state — guarding is the parent\'s job', () => {
    const mockFlip = vi.fn();
    const { container } = render(
      <TarotCard card={card} size="md" onFlip={mockFlip} isFlipped={true} />
    );
    const cardDiv = container.querySelector('[style*="perspective"]') as HTMLElement;
    cardDiv?.click();
    expect(mockFlip).toHaveBeenCalled();
  });

  it('should apply rotate(180deg) to the face image when reversed and flipped', () => {
    const { container } = render(
      <TarotCard card={card} size="md" isReversed={true} isFlipped={true} />
    );
    // The face img is inside the front face div (rotateY 180deg container)
    const imgs = container.querySelectorAll('img');
    // face img is the second img (first is card-back)
    const faceImg = imgs[1] as HTMLImageElement;
    expect(faceImg?.style.transform).toContain('rotate(180deg)');
  });

  it('should have correct image path on the face when flipped', () => {
    const { container } = render(<TarotCard card={card} size="md" isFlipped={true} />);
    const imgs = container.querySelectorAll('img');
    // face img is second (card-back is first)
    const faceImg = imgs[1] as HTMLImageElement;
    expect(faceImg?.src).toContain('/cards-cropped/ar00.png');
  });

  it('should render card-back image when not flipped', () => {
    const { container } = render(<TarotCard card={card} size="md" isFlipped={false} />);
    const backImg = container.querySelector('img') as HTMLImageElement;
    expect(backImg?.src).toContain('card-back.png');
  });
});
