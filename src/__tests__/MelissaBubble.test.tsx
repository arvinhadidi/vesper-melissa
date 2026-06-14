import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MelissaBubble from '@/components/melissa/MelissaBubble';

describe('MelissaBubble', () => {
  it('should render idle state with default message', () => {
    render(<MelissaBubble state="idle" />);
    expect(screen.getByText("What's been weighing on you?")).toBeInTheDocument();
  });

  it('should render idle state with custom message', () => {
    render(<MelissaBubble state="idle" idleMessage="Custom message" />);
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('should render thinking state with dots and label', () => {
    render(<MelissaBubble state="thinking" />);
    expect(screen.getByText('Reading your cards...')).toBeInTheDocument();
    // The three dot divs are rendered; verify the container has child divs
    const { container } = render(<MelissaBubble state="thinking" />);
    const dots = container.querySelectorAll('div > div > div > div');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('should render streaming state with text', () => {
    const text = 'This is streaming text';
    render(<MelissaBubble state="streaming" text={text} />);
    expect(screen.getByText(new RegExp(text))).toBeInTheDocument();
  });

  it('should render complete state with text', () => {
    const text = 'This is complete text';
    render(<MelissaBubble state="complete" text={text} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('should render avatar fallback M when image errors', () => {
    render(<MelissaBubble state="idle" />);
    // Before image loads, AvatarFallback renders the M span
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should render all states without crashing', () => {
    const states = ['idle', 'thinking', 'streaming', 'complete'] as const;
    states.forEach(state => {
      const { unmount } = render(
        <MelissaBubble state={state} text="test text" />
      );
      unmount();
    });
  });

  it('should have an outer wrapper div', () => {
    const { container } = render(<MelissaBubble state="idle" />);
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeTruthy();
  });
});
