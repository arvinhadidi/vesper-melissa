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

  const isCustom = selectedQuestion?.id === 'custom';
  const isShuffleDisabled = !selectedQuestion || (isCustom && !customText.trim());

  function handleShuffle() {
    if (!selectedQuestion || !profile) return;
    const ts = Date.now();
    const id = `reading-${ts}`;
    const finalQuestionText = isCustom ? customText : selectedQuestion.text;
    const promptContext = isCustom ? '' : selectedQuestion.promptContext;

    type DrawnCard = { cardIndex: number; isReversed: boolean };
    const cards = getSpreadCards(profile.id, ts, selectedQuestion.cardCount) as DrawnCard[];

    sessionStorage.setItem(`reading-${id}`, JSON.stringify({
      type: 'spread',
      questionText: finalQuestionText,
      cards,
      positionLabels: selectedQuestion.positionLabels,
      promptContext,
      userProfile: profile,
    }));

    router.push(`/spread/${id}`);
  }

  return (
    <div style={{
      minHeight: '100dvh',
      padding: '48px 24px 120px',
    }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '11px',
          color: '#C9A84C',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          margin: '0 0 8px',
        }}>
          SPREAD
        </p>
        <h1 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '22px',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: 0,
        }}>
          What do you want to ask?
        </h1>
      </div>

      <div style={{ marginBottom: '24px' }}>
        {SPREAD_QUESTIONS.map(q => {
          const selected = selectedQuestion?.id === q.id;
          return (
            <div key={q.id}>
              <button
                onClick={() => setSelectedQuestion(q)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: `1px solid ${selected ? '#C9A84C' : 'rgba(201,168,76,0.35)'}`,
                  borderRadius: '12px',
                  marginBottom: '10px',
                  background: selected ? '#C9A84C' : '#FAF7F0',
                  color: '#1E1256',
                  fontFamily: 'var(--font-garamond-var), Georgia, serif',
                  fontSize: '15.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{q.text}</span>
                {selected && <span style={{ fontSize: '14px' }}>✓</span>}
              </button>

              {selected && q.id === 'custom' && (
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="What's been on your mind?"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid rgba(201,168,76,0.35)',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-garamond-var), Georgia, serif',
                    fontSize: '15px',
                    minHeight: '80px',
                    resize: 'none',
                    background: '#FAF7F0',
                    color: '#1E1256',
                    marginTop: '2px',
                    marginBottom: '10px',
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
          padding: '14px',
          borderRadius: '12px',
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontWeight: 500,
          fontSize: '15px',
          border: 'none',
          cursor: isShuffleDisabled ? 'default' : 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        Shuffle the cards
      </button>
    </div>
  );
}
