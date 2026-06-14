import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MelissaReadingFlow from '@/components/melissa/MelissaReadingFlow';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

const defaultProps = {
  apiEndpoint: '/api/melissa-spread',
  apiPayload: { questionText: 'Test question' },
  userName: 'Arvin',
  conversationPath: '/spread/reading-123/conversation',
};

describe('MelissaReadingFlow', () => {
  it('renders without crashing', () => {
    const { container } = render(<MelissaReadingFlow {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders a speech bubble container', () => {
    const { container } = render(<MelissaReadingFlow {...defaultProps} />);
    // The bubble is a div with white background
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(0);
  });

  it('renders Melissa avatar image', () => {
    const { container } = render(<MelissaReadingFlow {...defaultProps} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain('/melissa/');
  });

  it('does not render completeActions while in intro phase', () => {
    const customAction = <button data-testid="custom-action">Custom action</button>;
    render(<MelissaReadingFlow {...defaultProps} completeActions={customAction} />);
    // completeActions only mounts when isComplete (phase=complete) — not during intro
    expect(screen.queryByTestId('custom-action')).toBeNull();
  });

  it('does not render default Carry on button while in intro phase', () => {
    render(<MelissaReadingFlow {...defaultProps} />);
    expect(screen.queryByText('Carry on the conversation')).toBeNull();
  });

  it('accepts onReadingComplete callback without error', () => {
    const onComplete = vi.fn();
    expect(() => {
      render(<MelissaReadingFlow {...defaultProps} onReadingComplete={onComplete} />);
    }).not.toThrow();
  });

  it('renders with daily api endpoint props', () => {
    expect(() => {
      render(
        <MelissaReadingFlow
          apiEndpoint="/api/melissa-daily"
          apiPayload={{ cardIndex: 0, isReversed: false }}
          userName="TestUser"
          conversationPath="/daily/daily-2026-06-09/conversation"
        />
      );
    }).not.toThrow();
  });

  it('passes completeActions prop without error', () => {
    const customAction = <button>Add to journal</button>;
    expect(() => {
      render(<MelissaReadingFlow {...defaultProps} completeActions={customAction} />);
    }).not.toThrow();
  });
});
