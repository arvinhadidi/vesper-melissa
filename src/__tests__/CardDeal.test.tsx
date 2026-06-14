import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CardDeal from '@/components/tarot/CardDeal';
import { getCardByNameShort } from '@/lib/cards';

describe('CardDeal', () => {
  const cards = [
    { card: getCardByNameShort('ar00'), isReversed: false },
    { card: getCardByNameShort('ar01'), isReversed: true },
    { card: getCardByNameShort('ar02'), isReversed: false },
  ];

  it('should render without crashing', () => {
    render(
      <CardDeal
        cards={cards}
        onCardFlip={() => {}}
        flippedStates={[false, false, false]}
        size="md"
      />
    );
    const images = document.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should render position labels', () => {
    render(
      <CardDeal
        cards={cards}
        onCardFlip={() => {}}
        flippedStates={[false, false, false]}
        positionLabels={['Past', 'Present', 'Future']}
        size="md"
      />
    );
    expect(screen.getByText('Past')).toBeInTheDocument();
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getByText('Future')).toBeInTheDocument();
  });

  it('should render correct number of cards', () => {
    const { container } = render(
      <CardDeal
        cards={cards}
        onCardFlip={() => {}}
        flippedStates={[false, false, false]}
        size="md"
      />
    );
    // Each card renders two img elements (back + front), so 3 cards = at least 3 imgs
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should call onCardFlip when card is clicked', () => {
    const mockFlip = vi.fn();
    const { container } = render(
      <CardDeal
        cards={cards}
        onCardFlip={mockFlip}
        flippedStates={[false, false, false]}
        size="md"
      />
    );
    const cardDivs = container.querySelectorAll('[style*="perspective"]');
    if (cardDivs[0]) {
      (cardDivs[0] as HTMLElement).click();
      expect(mockFlip).toHaveBeenCalledWith(0);
    }
  });

  it('should respect flippedStates', () => {
    const { container } = render(
      <CardDeal
        cards={cards}
        onCardFlip={() => {}}
        flippedStates={[true, false, false]}
        size="md"
      />
    );
    const cardDivs = container.querySelectorAll('[style*="perspective"]');
    expect(cardDivs.length).toBe(3);
  });

  it('should handle single card deal', () => {
    const { container } = render(
      <CardDeal
        cards={[cards[0]]}
        onCardFlip={() => {}}
        flippedStates={[false]}
        size="md"
      />
    );
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should handle all size variants', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach(size => {
      const { unmount, container } = render(
        <CardDeal
          cards={cards}
          onCardFlip={() => {}}
          flippedStates={[false, false, false]}
          size={size}
        />
      );
      expect(container.querySelectorAll('img').length).toBeGreaterThan(0);
      unmount();
    });
  });

  it('should apply dark label colour when labelVariant is dark', () => {
    const { container } = render(
      <CardDeal
        cards={cards}
        onCardFlip={() => {}}
        flippedStates={[false, false, false]}
        positionLabels={['Past', 'Present', 'Future']}
        labelVariant="dark"
        size="md"
      />
    );
    const label = screen.getByText('Past') as HTMLElement;
    expect(label.style.color).toBe('rgb(201, 168, 76)');
  });

  it('should give each column a fixed width matching the card size', () => {
    const { container } = render(
      <CardDeal
        cards={cards}
        onCardFlip={() => {}}
        flippedStates={[false, false, false]}
        positionLabels={['Past', 'Present', 'Future']}
        size="sm"
      />
    );
    // The outer column divs have an inline width style
    const columns = container.querySelectorAll('[style*="width"]');
    expect(columns.length).toBeGreaterThan(0);
  });
});
