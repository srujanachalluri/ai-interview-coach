import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSpeechToText } from '../../hooks/useSpeechToText';

// Suggested answer time per difficulty (seconds) — drives the pacing meter.
const TARGET_SECONDS = { Easy: 90, Medium: 150, Hard: 240 };

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function QuestionCard({ question, index, total, onSubmit, loading, difficulty = 'Medium', initialAnswer = '' }) {
  const isMobile = useIsMobile();
  const [answer, setAnswer] = useState(initialAnswer);
  const [showHint, setShowHint] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const taRef = useRef(null);

  const target = TARGET_SECONDS[difficulty] || 150;

  // Voice dictation appends recognized text to the answer.
  const { supported: voiceSupported, listening, start, stop, error: voiceError } =
    useSpeechToText((text) => {
      setAnswer((prev) => (prev ? prev.trimEnd() + ' ' : '') + text.trim());
    });

  // Reset per-question state and restart the timer when the question changes.
  useEffect(() => {
    setAnswer(initialAnswer);
    setShowHint(false);
    setElapsed(0);
    if (listening) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [index]);

  const handleSubmit = () => {
    if (!answer.trim() || loading) return;
    if (listening) stop();
    onSubmit(answer.trim());
  };

  const progress = (index / total) * 100;
  const overTarget = elapsed > target;
  const nearTarget = !overTarget && elapsed > target * 0.75;
  const timerColor = overTarget ? '#f87171' : nearTarget ? '#fbbf24' : '#64748b';
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const pad = isMobile ? '18px' : '28px';

  return (
    <div className="fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* Progress + timer */}
      <div style={{ marginBottom: isMobile ? '20px' : '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
            Question {index + 1} of {total}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            color: timerColor, fontSize: '13px', fontWeight: '700',
            fontVariantNumeric: 'tabular-nums',
          }}>
            ⏱ {fmt(elapsed)}
            <span style={{ color: '#334155', fontWeight: 500 }}>/ {fmt(target)}</span>
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '6px' }}>
          <div style={{
            width: `${progress}%`, height: '100%', borderRadius: '8px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        {overTarget && (
          <p style={{ color: '#f87171', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>
            ⚡ You're over the suggested time — in a real interview, aim to be concise.
          </p>
        )}
      </div>

      {/* Question */}
      <div style={{
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '16px', padding: pad, marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '12px' : '16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: '800', color: 'white',
          }}>Q{index + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#f1f5f9', fontSize: isMobile ? '16px' : '17px', fontWeight: '600', lineHeight: '1.6', letterSpacing: '-0.2px' }}>
              {question.question}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc', fontSize: '11px', fontWeight: '700',
                padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{question.type}</span>
              <button
                onClick={() => setShowHint(!showHint)}
                style={{
                  background: 'none', border: 'none', color: '#475569',
                  fontSize: '12px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '20px',
                }}
              >
                💡 {showHint ? 'Hide hint' : 'Show hint'}
              </button>
            </div>
            {showHint && (
              <div className="fade-in" style={{
                marginTop: '12px', padding: '12px 14px',
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '10px',
              }}>
                <p style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '500' }}>
                  💡 {question.hint}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer Input */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: isMobile ? '16px' : '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Answer
          </label>
          {voiceSupported && (
            <button
              onClick={listening ? stop : start}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: listening ? 'rgba(248,113,113,0.15)' : 'rgba(99,102,241,0.12)',
                border: `1px solid ${listening ? 'rgba(248,113,113,0.4)' : 'rgba(99,102,241,0.3)'}`,
                color: listening ? '#f87171' : '#a5b4fc',
                borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '700',
                animation: listening ? 'recPulse 1.5s infinite' : 'none',
              }}
            >
              {listening ? '⏹ Stop' : '🎙 Speak'}
              {listening && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', animation: 'pulse 1s infinite' }} />}
            </button>
          )}
        </div>

        <textarea
          ref={taRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder={voiceSupported
            ? "Type your answer, or tap 🎙 Speak to dictate it aloud..."
            : "Type your answer here... Be thorough and specific. Use examples from your experience."}
          rows={isMobile ? 7 : 8}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${listening ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '12px',
            padding: '14px 16px', color: '#f1f5f9', fontSize: '15px',
            outline: 'none', resize: 'vertical', lineHeight: '1.6',
            minHeight: isMobile ? '150px' : '180px', transition: 'border-color 0.2s',
          }}
          onFocus={e => { if (!listening) e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
          onBlur={e => { if (!listening) e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />

        {voiceError && (
          <p style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>🎙 {voiceError}</p>
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '14px', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <p style={{ color: '#334155', fontSize: '12px' }}>
            {answer.length} chars · {wordCount} words
          </p>
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            style={{
              background: answer.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: '12px',
              padding: isMobile ? '13px 24px' : '12px 32px', fontSize: '14px', fontWeight: '700',
              color: answer.trim() && !loading ? 'white' : '#334155',
              cursor: answer.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s', flex: isMobile ? '1 1 100%' : '0 0 auto',
              boxShadow: answer.trim() && !loading ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            {loading ? <><span className="spinner" /> Evaluating...</> : '✓ Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}
