'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard, getCardById, getCardImagePath } from '@/lib/cards';
import { TEST_USER } from '@/lib/testUser';
import { track } from '@/lib/analytics';

type Message = { role: 'user' | 'assistant'; content: string; revealed?: boolean };

interface DailyContext {
  type?: 'daily';
  card: TarotCard;
  isReversed: boolean;
  readingText: string;
  userProfile: typeof TEST_USER;
}

interface SpreadContext {
  type: 'spread';
  questionText: string;
  cards: Array<{ cardIndex: number; isReversed: boolean }>;
  positionLabels: string[];
  promptContext: string;
  userProfile: typeof TEST_USER;
  readingText: string;
}

type ReadingContext = DailyContext | SpreadContext;

function isSpreadContext(ctx: ReadingContext): ctx is SpreadContext {
  return ctx.type === 'spread';
}

interface MelissaChatPageProps {
  sessionKey: string;
  backPath?: string;
}

const CHAT_TYPEWRITER_SPEED = 18;

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(30,18,86,0.35)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      style={{ display: 'inline-block', width: '2px', height: '14px', background: '#1E1256', verticalAlign: 'middle', marginLeft: '2px' }}
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    />
  );
}

function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    doneRef.current = false;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone();
        }
      }
    }, CHAT_TYPEWRITER_SPEED);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const isTyping = displayed.length < text.length;

  return (
    <p style={{
      fontFamily: 'var(--font-garamond-var), Georgia, serif',
      fontStyle: 'italic',
      fontSize: '14.5px',
      color: '#1E1256',
      lineHeight: '1.6',
      margin: 0,
      whiteSpace: 'pre-wrap',
    }}>
      {displayed}
      {isTyping && <BlinkingCursor />}
    </p>
  );
}

export default function MelissaChatPage({ sessionKey, backPath }: MelissaChatPageProps) {
  const router = useRouter();

  const [context, setContext] = useState<ReadingContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // True once the user has sent a message in this visit — guards the mount-time
  // history fetch below from overwriting it if that GET resolves afterward
  // (it's a snapshot from before the send, so it would erase the new message
  // and/or the in-progress streaming reply if applied blindly).
  const hasSentRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`reading-${sessionKey}`);
    if (!raw) { setNotFound(true); return; }
    const ctx = JSON.parse(raw) as ReadingContext;
    setContext(ctx);

    const initialBubble: Message = { role: 'assistant', content: ctx.readingText, revealed: true };

    // sessionStorage cache paints instantly while the durable fetch below resolves.
    const cached = sessionStorage.getItem(`chat-messages-${sessionKey}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map(m => ({ ...m, revealed: true })));
        } else {
          setMessages([initialBubble]);
        }
      } catch {
        setMessages([initialBubble]);
      }
    } else {
      setMessages([initialBubble]);
    }

    // Durable history from Supabase is the source of truth — reconcile once it
    // loads, since the sessionStorage cache won't follow you to a new tab/device.
    fetch(`/api/chat-messages?readingId=${encodeURIComponent(sessionKey)}`)
      .then(res => (res.ok ? res.json() : null))
      .then((remote: { role: 'user' | 'assistant'; content: string }[] | null) => {
        if (!remote || hasSentRef.current) return;
        const merged: Message[] = [
          initialBubble,
          ...remote.map(m => ({ role: m.role, content: m.content, revealed: true })),
        ];
        setMessages(merged);
        sessionStorage.setItem(`chat-messages-${sessionKey}`, JSON.stringify(merged));
      })
      .catch(() => {/* keep whatever the sessionStorage cache already produced */});
  }, [sessionKey]);

  // Keep the sessionStorage cache in sync for instant paint on the next visit.
  useEffect(() => {
    if (messages.length === 0) return;
    sessionStorage.setItem(`chat-messages-${sessionKey}`, JSON.stringify(messages));
  }, [messages, sessionKey]);

  // Best-effort durable persist — fire-and-forget, mirrors the pattern in lib/journal.ts.
  function persistMessage(role: 'user' | 'assistant', content: string) {
    fetch('/api/chat-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: sessionKey, role, content }),
    }).catch(() => {/* silently fall back to sessionStorage-only */});
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, isRevealing]);

  function handleRevealDone(index: number) {
    setMessages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], revealed: true };
      return updated;
    });
    setIsRevealing(false);
  }

  async function handleSend() {
    if (!input.trim() || isStreaming || isRevealing || !context) return;

    track('chat_message_sent', { chat_type: isSpreadContext(context) ? 'spread' : 'daily' });
    hasSentRef.current = true;
    const userMessage: Message = { role: 'user', content: input.trim(), revealed: true };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    persistMessage('user', userMessage.content);
    setInput('');
    setIsStreaming(true);

    setMessages(prev => [...prev, { role: 'assistant', content: '', revealed: false }]);

    const apiBody = isSpreadContext(context)
      ? {
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          spreadContext: {
            questionText: context.questionText,
            cards: context.cards,
            positionLabels: context.positionLabels,
          },
          userProfile: context.userProfile,
        }
      : {
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          cardContext: { card: context.card, isReversed: context.isReversed },
          userProfile: context.userProfile,
        };

    const response = await fetch('/api/melissa-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiBody),
    });

    if (!response.ok || !response.body) {
      setIsStreaming(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: 'assistant', content: fullText, revealed: false };
      return updated;
    });
    persistMessage('assistant', fullText);
    setIsStreaming(false);
    setIsRevealing(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (notFound) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
        fontFamily: 'var(--font-garamond-var), Georgia, serif',
      }}>
        <p style={{ fontSize: '16px', color: 'rgba(250,247,240,0.6)', marginBottom: '20px', textAlign: 'center' }}>
          Nothing to see here yet.
        </p>
        <button
          onClick={() => backPath ? router.push(backPath) : router.back()}
          style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px',
            color: '#FAF7F0', background: 'transparent',
            border: '1px solid rgba(250,247,240,0.35)', borderRadius: '10px',
            padding: '10px 20px', cursor: 'pointer',
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  const inputDisabled = isStreaming || isRevealing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(250,247,240,0.12)',
        background: 'rgba(18,11,58,0.75)',
        flexShrink: 0,
        position: 'relative',
      }}>
        <div style={{ flex: 1 }}>
          <button
            onClick={() => backPath ? router.push(backPath) : router.back()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(250,247,240,0.6)', display: 'flex', alignItems: 'center',
              padding: '4px',
            }}
            aria-label="Back"
          >
            <BackIcon />
          </button>
        </div>

        <span style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '16px',
          color: '#FAF7F0',
          whiteSpace: 'nowrap',
        }}>
          Melissa
        </span>

        <div style={{ flex: 1 }} />
      </div>

      {/* Context strip */}
      {context && (
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(250,247,240,0.12)',
          background: 'rgba(18,11,58,0.75)',
          flexShrink: 0,
        }}>
          {isSpreadContext(context) ? (
            // Spread: 3 small cards side-by-side with names to the right
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {context.cards.map((c, i) => {
                const card = getCardById(c.cardIndex);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <img
                      src={getCardImagePath(card.name_short)}
                      alt={card.name}
                      style={{
                        width: '36px',
                        borderRadius: '5px',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(30,18,86,0.15)',
                        transform: c.isReversed ? 'rotate(180deg)' : 'none',
                      }}
                    />
                    <div>
                      <p style={{
                        fontFamily: 'var(--font-dm-serif-var), serif',
                        fontSize: '11px',
                        color: '#FAF7F0',
                        margin: 0,
                        lineHeight: '1.3',
                      }}>
                        {card.name}
                      </p>
                      {c.isReversed && (
                        <p style={{
                          fontFamily: 'var(--font-dm-sans-var), sans-serif',
                          fontSize: '9px',
                          color: 'rgba(250,247,240,0.5)',
                          margin: '1px 0 0',
                        }}>
                          Reversed
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Daily: single card + name
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={getCardImagePath(context.card.name_short)}
                alt={context.card.name}
                style={{
                  width: '36px',
                  borderRadius: '5px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(30,18,86,0.15)',
                  transform: context.isReversed ? 'rotate(180deg)' : 'none',
                }}
              />
              <div>
                <p style={{
                  fontFamily: 'var(--font-dm-serif-var), serif',
                  fontSize: '13px',
                  color: '#FAF7F0',
                  margin: 0,
                }}>
                  {context.card.name}
                </p>
                {context.isReversed && (
                  <p style={{
                    fontFamily: 'var(--font-dm-sans-var), sans-serif',
                    fontSize: '10px',
                    color: 'rgba(250,247,240,0.5)',
                    margin: '2px 0 0',
                  }}>
                    Reversed
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isAssistant = msg.role === 'assistant';
            const isLastMsg = i === messages.length - 1;
            const showDots = isLastMsg && isStreaming && msg.content === '';
            const showTypewriter = isAssistant && !msg.revealed && msg.content !== '' && isLastMsg;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  flexDirection: isAssistant ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                {/* No avatar per-message — repeating it next to every bubble in a
                    back-and-forth conversation is visual clutter (matches the
                    convention in iMessage/WhatsApp: side + color is the speaker
                    cue, not a repeated avatar). Bubble alignment alone already
                    distinguishes Melissa (left) from the user (right) via the
                    row/row-reverse flex-direction above. */}
                <div style={{
                  maxWidth: '78%',
                  background: isAssistant ? '#FAF7F0' : '#C9A84C',
                  borderRadius: isAssistant ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  padding: '12px 14px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                  border: isAssistant ? '1px solid rgba(201,168,76,0.3)' : 'none',
                }}>
                  {showDots ? (
                    <ThinkingDots />
                  ) : showTypewriter ? (
                    <TypewriterText
                      text={msg.content}
                      onDone={() => handleRevealDone(i)}
                    />
                  ) : (
                    <p style={{
                      fontFamily: 'var(--font-garamond-var), Georgia, serif',
                      fontStyle: isAssistant ? 'italic' : 'normal',
                      fontSize: '14.5px',
                      color: '#1E1256',
                      lineHeight: '1.6',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar. On phone, the bottom nav pill is position:fixed with a higher
          z-index, so this needs extra bottom clearance there or the nav renders
          on top of it — desktop has no bottom nav at all (SideNav is on the left),
          so only the mobile rule below applies. */}
      <style>{`
        .chat-input-bar { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
        @media (max-width: 700px) {
          .chat-input-bar { padding-bottom: calc(92px + env(safe-area-inset-bottom)); }
        }
      `}</style>
      <div className="chat-input-bar" style={{
        paddingTop: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
        borderTop: '1px solid rgba(250,247,240,0.12)',
        background: 'rgba(18,11,58,0.75)',
        display: 'flex', gap: '10px', alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Melissa anything..."
          rows={1}
          disabled={inputDisabled}
          style={{
            flex: 1,
            fontFamily: 'var(--font-garamond-var), Georgia, serif',
            fontSize: '15px',
            color: '#1E1256',
            background: '#FAF7F0',
            border: '1px solid rgba(201,168,76,0.35)',
            borderRadius: '12px',
            padding: '11px 14px',
            resize: 'none',
            outline: 'none',
            lineHeight: '1.5',
            maxHeight: '120px',
            overflowY: 'auto',
            opacity: inputDisabled ? 0.5 : 1,
          }}
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || inputDisabled}
          style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: input.trim() && !inputDisabled ? '#C9A84C' : 'rgba(250,247,240,0.15)',
            border: 'none',
            cursor: input.trim() && !inputDisabled ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: input.trim() && !inputDisabled ? '#1E1256' : 'rgba(250,247,240,0.4)',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
