'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSpreadCards } from '@/lib/cardLogic.js';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { SPREAD_QUESTIONS, SpreadQuestion } from '@/data/spreadQuestions';

export default function SpreadPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [selectedQuestion, setSelectedQuestion] = useState<SpreadQuestion | null>(null);
  const [customText, setCustomText] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);

  const isCustom = selectedQuestion?.id === 'custom';
  const isShuffleDisabled = !selectedQuestion || (isCustom && !customText.trim()) || isShuffling;

  async function handleShuffle() {
    if (!selectedQuestion || !profile) return;
    const ts = Date.now();
    const id = `reading-${ts}`;
    const finalQuestionText = isCustom ? customText : selectedQuestion.text;
    const promptContext = isCustom ? '' : selectedQuestion.promptContext;

    type DrawnCard = { cardIndex: number; isReversed: boolean };
    const cards = getSpreadCards(profile.id, ts, selectedQuestion.cardCount) as DrawnCard[];

    let positionLabels = selectedQuestion.positionLabels;
    if (isCustom) {
      setIsShuffling(true);
      try {
        const res = await fetch('/api/melissa-spread-labels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionText: finalQuestionText, cardCount: selectedQuestion.cardCount }),
        });
        if (res.ok) {
          const { labels } = await res.json() as { labels: string[] };
          positionLabels = labels;
        }
      } catch {
        // fall back to the static Past/Present/Future labels
      }
    }

    sessionStorage.setItem(`reading-${id}`, JSON.stringify({
      type: 'spread',
      questionText: finalQuestionText,
      cards,
      positionLabels,
      promptContext,
      userProfile: profile,
    }));

    router.push(`/spread/${id}`);
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px 120px',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#C9A84C',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            margin: '0 0 12px',
          }}>
            SPREAD
          </p>
          <h1 style={{
            fontFamily: 'var(--font-dm-serif-var), serif',
            fontSize: 'clamp(32px, 10vw, 44px)',
            fontWeight: 400,
            color: '#FAF7F0',
            margin: 0,
            lineHeight: 1.12,
          }}>
            What do you want to ask?
          </h1>
        </div>

        <div style={{ marginBottom: '28px' }}>
          {SPREAD_QUESTIONS.map(q => {
            const selected = selectedQuestion?.id === q.id;
            const isCustomOption = q.id === 'custom';
            return (
              <div key={q.id}>
                <button
                  onClick={() => setSelectedQuestion(q)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    border: selected
                      ? '1px solid #C9A84C'
                      : isCustomOption
                        ? '1.5px solid #C9A84C'
                        : '1px solid rgba(201,168,76,0.35)',
                    borderRadius: '14px',
                    marginBottom: '12px',
                    background: selected ? '#C9A84C' : '#FAF7F0',
                    color: '#1E1256',
                    fontFamily: 'var(--font-garamond-var), Georgia, serif',
                    fontSize: '18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    textTransform: 'lowercase',
                  }}
                >
                  <span>{q.text}</span>
                </button>

                {selected && q.id === 'custom' && (
                  <textarea
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="What's been on your mind?"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid rgba(201,168,76,0.35)',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-garamond-var), Georgia, serif',
                      fontSize: '17px',
                      minHeight: '100px',
                      resize: 'none',
                      background: '#FAF7F0',
                      color: '#1E1256',
                      marginTop: '2px',
                      marginBottom: '12px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleShuffle}
          disabled={isShuffleDisabled}
          style={{
            width: '100%',
            background: isShuffleDisabled ? 'rgba(201,168,76,0.4)' : '#C9A84C',
            color: '#1E1256',
            padding: '18px',
            borderRadius: '14px',
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontWeight: 500,
            fontSize: '17px',
            border: 'none',
            cursor: isShuffleDisabled ? 'default' : 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          {isShuffling ? 'Shuffling...' : 'Shuffle the cards'}
        </button>
      </div>
    </div>
  );
}
