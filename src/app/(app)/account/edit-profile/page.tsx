'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { ZODIAC_SIGNS } from '@/lib/onboarding/constants';
import { getZodiacSign } from '@/lib/onboarding/helpers';
import {
  MOOD_OPTIONS,
  NOTICES_SIGNS_OPTIONS,
  FOCUS_AREA_OPTIONS,
  LOVE_SITUATION_OPTIONS,
  OTHER_SITUATION_OPTIONS,
  SPECIFIC_PERSON_OPTIONS,
  DURATION_OPTIONS,
  READING_INTENT_OPTIONS,
  GUT_FEELING_OPTIONS,
  CHECKIN_TIME_OPTIONS,
} from '@/lib/onboarding/options';
import type { UserProfile } from '@/lib/types';

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

type FormState = {
  displayName: string;
  starSign: string;
  birthDate: string | null;
  currentMood: string | null;
  noticesSigns: string | null;
  focusArea: UserProfile['focusArea'];
  relationshipStatus: string | null;
  lifeWeight: string | null;
  hasSpecificPerson: UserProfile['hasSpecificPerson'];
  durationWeight: string | null;
  readingIntent: string[];
  gutFeeling: string | null;
  preferredCheckinTime: string | null;
  emailMarketingConsent: boolean;
};

function profileToForm(p: UserProfile): FormState {
  return {
    displayName: p.displayName,
    starSign: p.starSign,
    birthDate: p.birthDate,
    currentMood: p.currentMood,
    noticesSigns: p.noticesSigns,
    focusArea: p.focusArea,
    relationshipStatus: p.relationshipStatus,
    lifeWeight: p.lifeWeight,
    hasSpecificPerson: p.hasSpecificPerson,
    durationWeight: p.durationWeight,
    readingIntent: p.readingIntent,
    gutFeeling: p.gutFeeling,
    preferredCheckinTime: p.preferredCheckinTime,
    emailMarketingConsent: p.emailMarketingConsent,
  };
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans-var), sans-serif',
  fontSize: '13px',
  fontWeight: 500,
  color: 'rgba(250,247,240,0.5)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-garamond-var), Georgia, serif',
  fontSize: '17px',
  color: '#FAF7F0',
};

// Option labels that start with an emoji use a double space to separate it from
// the text (e.g. "🌧️  Heavy") — only strip on that exact double-space marker, so
// plain multi-word labels with no emoji ("I try to") are left untouched.
function rowLabel(options: { label: string; value: string | null }[], value: string | null): string {
  return options.find(o => o.value === value)?.label.replace(/^\S+ {2}/, '') ?? 'Not set';
}

function SectionHeader({ title, first }: { title: string; first?: boolean }) {
  return (
    <p style={{
      fontFamily: 'var(--font-dm-sans-var), sans-serif',
      fontSize: '12px',
      fontWeight: 500,
      color: '#C9A84C',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      margin: first ? '0 0 12px' : '28px 0 12px',
    }}>
      {title}
    </p>
  );
}

function Row({
  title, valueLabel, expanded, onToggle, children,
}: {
  title: string;
  valueLabel: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      width: '100%',
      background: 'rgba(250,247,240,0.04)',
      border: '1px solid rgba(201,168,76,0.25)',
      borderRadius: '16px',
      padding: '18px 20px',
      marginBottom: '14px',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left',
        }}
      >
        <div>
          <p style={{ ...labelStyle, margin: '0 0 6px' }}>{title}</p>
          <p style={{ ...valueStyle, margin: 0 }}>{valueLabel}</p>
        </div>
        <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#C9A84C' }}>
          {expanded ? 'Close' : 'Change'}
        </span>
      </button>
      {expanded && <div style={{ marginTop: '16px' }}>{children}</div>}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();
  const [form, setForm] = useState<FormState | null>(null);
  const [original, setOriginal] = useState<FormState | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDay, setPickerDay] = useState<number | ''>('');
  const [pickerMonth, setPickerMonth] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const f = profileToForm(profile);
      setForm(f);
      setOriginal(f);
    }
  }, [profile]);

  function update(patch: Partial<FormState>) {
    setForm(prev => (prev ? { ...prev, ...patch } : prev));
    setSaved(false);
  }

  function toggleRow(key: string) {
    setExpandedRow(prev => (prev === key ? null : key));
  }

  function toggleReadingIntent(value: string) {
    if (!form) return;
    const has = form.readingIntent.includes(value);
    if (has) {
      update({ readingIntent: form.readingIntent.filter(v => v !== value) });
    } else if (form.readingIntent.length < 2) {
      update({ readingIntent: [...form.readingIntent, value] });
    }
  }

  async function handleSave() {
    if (!form || saving) return;
    setSaving(true);
    setSaveError(null);

    const body = {
      display_name: form.displayName,
      star_sign: form.starSign || null,
      birth_date: form.birthDate,
      current_mood: form.currentMood,
      notices_signs: form.noticesSigns,
      focus_area: form.focusArea,
      relationship_status: form.relationshipStatus,
      life_weight: form.lifeWeight,
      has_specific_person: form.hasSpecificPerson,
      duration_weight: form.durationWeight,
      reading_intent: form.readingIntent,
      gut_feeling: form.gutFeeling,
      preferred_checkin_time: form.preferredCheckinTime,
      email_marketing_consent: form.emailMarketingConsent,
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setSaveError("Couldn't save your changes. Please try again.");
      } else {
        setOriginal(form);
        setSaved(true);
      }
    } catch {
      setSaveError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.6)' }}>Loading...</p>
      </div>
    );
  }

  const dirty = original !== null && JSON.stringify(form) !== JSON.stringify(original);
  const isLove = form.focusArea === 'love_relationships';
  const situationOptions = isLove ? LOVE_SITUATION_OPTIONS : OTHER_SITUATION_OPTIONS;
  const situationValue = isLove ? form.relationshipStatus : form.lifeWeight;
  const zodiacSign = ZODIAC_SIGNS.find(s => s.value === form.starSign);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 24px 140px',
      maxWidth: '520px',
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => router.push('/account')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(250,247,240,0.6)', display: 'flex', alignItems: 'center',
            padding: '4px', marginRight: '8px',
          }}
          aria-label="Back"
        >
          <BackIcon />
        </button>
        <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '22px', fontWeight: 400, color: '#FAF7F0', margin: 0 }}>
          Edit Profile
        </h1>
      </div>

      <SectionHeader title="About you" first />

      <Row title="Name" valueLabel={form.displayName || 'Not set'} expanded={expandedRow === 'name'} onToggle={() => toggleRow('name')}>
        <input
          type="text"
          value={form.displayName}
          onChange={e => update({ displayName: e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 15) })}
          maxLength={15}
          placeholder="your name..."
          style={{
            width: '100%', padding: '14px', background: 'rgba(250,247,240,0.07)',
            border: '1px solid rgba(201,168,76,0.4)', borderRadius: '12px',
            fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px',
            color: '#FAF7F0', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </Row>

      <Row
        title="Star sign"
        valueLabel={zodiacSign?.label ?? 'Not set'}
        expanded={expandedRow === 'starSign'}
        onToggle={() => toggleRow('starSign')}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {ZODIAC_SIGNS.map(sign => {
            const active = form.starSign === sign.value;
            return (
              <button
                key={sign.value}
                onClick={() => { setShowDatePicker(false); update({ starSign: sign.value, birthDate: null }); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '14px 8px', border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
                  borderRadius: '12px', background: active ? 'rgba(201,168,76,0.15)' : 'rgba(250,247,240,0.04)',
                  cursor: 'pointer', gap: '6px',
                }}
              >
                <span style={{ fontSize: '24px', color: '#C9A84C', lineHeight: 1 }}>{sign.glyph}</span>
                <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', color: active ? '#FAF7F0' : 'rgba(250,247,240,0.65)' }}>{sign.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowDatePicker(p => !p)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '14px 8px', border: `1px solid ${showDatePicker ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
              borderRadius: '12px', background: showDatePicker ? 'rgba(201,168,76,0.15)' : 'rgba(250,247,240,0.04)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', color: 'rgba(250,247,240,0.65)' }}>By date</span>
          </button>
        </div>
        {showDatePicker && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number" min={1} max={31} placeholder="Day" value={pickerDay}
              onChange={e => {
                const day = e.target.value === '' ? '' : Number(e.target.value);
                setPickerDay(day);
                if (day !== '' && pickerMonth !== '') {
                  const sign = getZodiacSign(day, pickerMonth);
                  const dStr = `${pickerMonth < 10 ? '0' : ''}${pickerMonth}-${day < 10 ? '0' : ''}${day}`;
                  update({ starSign: sign, birthDate: dStr });
                }
              }}
              style={{ flex: 1, padding: '12px', background: 'rgba(250,247,240,0.07)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '10px', color: '#FAF7F0', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', outline: 'none' }}
            />
            <input
              type="number" min={1} max={12} placeholder="Month" value={pickerMonth}
              onChange={e => {
                const month = e.target.value === '' ? '' : Number(e.target.value);
                setPickerMonth(month);
                if (pickerDay !== '' && month !== '') {
                  const sign = getZodiacSign(pickerDay, month);
                  const dStr = `${month < 10 ? '0' : ''}${month}-${pickerDay < 10 ? '0' : ''}${pickerDay}`;
                  update({ starSign: sign, birthDate: dStr });
                }
              }}
              style={{ flex: 1, padding: '12px', background: 'rgba(250,247,240,0.07)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '10px', color: '#FAF7F0', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', outline: 'none' }}
            />
          </div>
        )}
      </Row>

      <Row title="Mood" valueLabel={rowLabel(MOOD_OPTIONS, form.currentMood)} expanded={expandedRow === 'mood'} onToggle={() => toggleRow('mood')}>
        {MOOD_OPTIONS.map(opt => (
          <OptionTile key={opt.value} label={opt.label} selected={form.currentMood === opt.value} onClick={() => update({ currentMood: opt.value })} />
        ))}
      </Row>

      <Row title="Notices signs" valueLabel={rowLabel(NOTICES_SIGNS_OPTIONS, form.noticesSigns)} expanded={expandedRow === 'notices'} onToggle={() => toggleRow('notices')}>
        {NOTICES_SIGNS_OPTIONS.map(opt => (
          <OptionTile key={opt.value} label={opt.label} selected={form.noticesSigns === opt.value} onClick={() => update({ noticesSigns: opt.value })} />
        ))}
      </Row>

      <SectionHeader title="Your reading focus" />

      <Row title="Focus area" valueLabel={rowLabel(FOCUS_AREA_OPTIONS, form.focusArea)} expanded={expandedRow === 'focusArea'} onToggle={() => toggleRow('focusArea')}>
        {FOCUS_AREA_OPTIONS.map(opt => (
          <OptionTile
            key={opt.value}
            label={opt.label}
            selected={form.focusArea === opt.value}
            onClick={() => {
              update({
                focusArea: opt.value,
                relationshipStatus: opt.value === 'love_relationships' ? form.relationshipStatus : null,
                lifeWeight: opt.value === 'love_relationships' ? null : form.lifeWeight,
              });
              setExpandedRow('situation');
            }}
          />
        ))}
      </Row>

      <Row title="Situation" valueLabel={rowLabel(situationOptions, situationValue)} expanded={expandedRow === 'situation'} onToggle={() => toggleRow('situation')}>
        {situationOptions.map(opt => (
          <OptionTile
            key={opt.value}
            label={opt.label}
            selected={situationValue === opt.value}
            onClick={() => update(isLove ? { relationshipStatus: opt.value } : { lifeWeight: opt.value })}
          />
        ))}
      </Row>

      <Row title="Specific person" valueLabel={rowLabel(SPECIFIC_PERSON_OPTIONS, form.hasSpecificPerson)} expanded={expandedRow === 'specificPerson'} onToggle={() => toggleRow('specificPerson')}>
        {SPECIFIC_PERSON_OPTIONS.map(opt => (
          <OptionTile key={opt.value} label={opt.label} selected={form.hasSpecificPerson === opt.value} onClick={() => update({ hasSpecificPerson: opt.value as UserProfile['hasSpecificPerson'] })} />
        ))}
      </Row>

      <Row title="Duration" valueLabel={rowLabel(DURATION_OPTIONS, form.durationWeight)} expanded={expandedRow === 'duration'} onToggle={() => toggleRow('duration')}>
        {DURATION_OPTIONS.map(opt => (
          <OptionTile key={opt.value} label={opt.label} selected={form.durationWeight === opt.value} onClick={() => update({ durationWeight: opt.value })} />
        ))}
      </Row>

      <Row
        title="Reading intent"
        valueLabel={form.readingIntent.length > 0 ? form.readingIntent.map(v => rowLabel(READING_INTENT_OPTIONS, v)).join(', ') : 'Not set'}
        expanded={expandedRow === 'readingIntent'}
        onToggle={() => toggleRow('readingIntent')}
      >
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', color: 'rgba(250,247,240,0.4)', margin: '0 0 10px' }}>Pick up to 2</p>
        {READING_INTENT_OPTIONS.map(opt => (
          <OptionTile key={opt.value} label={opt.label} selected={form.readingIntent.includes(opt.value)} onClick={() => toggleReadingIntent(opt.value)} />
        ))}
      </Row>

      <Row title="Gut feeling" valueLabel={rowLabel(GUT_FEELING_OPTIONS, form.gutFeeling)} expanded={expandedRow === 'gutFeeling'} onToggle={() => toggleRow('gutFeeling')}>
        {GUT_FEELING_OPTIONS.map(opt => (
          <OptionTile key={opt.value} label={opt.label} selected={form.gutFeeling === opt.value} onClick={() => update({ gutFeeling: opt.value })} />
        ))}
      </Row>

      <SectionHeader title="Check-ins" />

      <Row
        title="Check-in time"
        valueLabel={form.preferredCheckinTime ? rowLabel(CHECKIN_TIME_OPTIONS, form.preferredCheckinTime) : 'No thanks'}
        expanded={expandedRow === 'checkin'}
        onToggle={() => toggleRow('checkin')}
      >
        {CHECKIN_TIME_OPTIONS.map(opt => (
          <OptionTile
            key={opt.value ?? 'none'}
            label={opt.label}
            selected={form.preferredCheckinTime === opt.value}
            onClick={() => update({ preferredCheckinTime: opt.value, emailMarketingConsent: opt.value !== null })}
          />
        ))}
      </Row>

      <div style={{
        position: 'sticky', bottom: '24px', marginTop: '12px',
      }}>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
            background: !dirty || saving ? 'rgba(201,168,76,0.4)' : '#C9A84C',
            color: '#1E1256', fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontWeight: 600, fontSize: '15px',
            cursor: !dirty || saving ? 'default' : 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
        {saveError && (
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#FF8A80', margin: '10px 0 0', textAlign: 'center' }}>
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}
