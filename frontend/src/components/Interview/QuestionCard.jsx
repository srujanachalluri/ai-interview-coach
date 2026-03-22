import { useState } from 'react';

export default function QuestionCard({ question, index, total, onSubmit, loading }) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim() || loading) return;
    onSubmit(answer.trim());
  };

  const progress = ((index) / total) * 100;

  return (
    <div className="fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
            Question {index + 1} of {total}
          </span>
          <span style={{ color: '#6366f1', fontSize: '13px', fontWeight: '700' }}>
            {Math.round(progress)}% complete
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '6px' }}>
          <div style={{
            width: `${progress}%`, height: '100%', borderRadius: '8px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '16px', padding: '28px', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '800', color: 'white',
          }}>Q{index + 1}</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#f1f5f9', fontSize: '17px', fontWeight: '600', lineHeight: '1.6', letterSpacing: '-0.2px' }}>
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
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '20px',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseOut={e => e.currentTarget.style.color = '#475569'}
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
        borderRadius: '16px', padding: '20px',
      }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Your Answer
        </label>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your answer here... Be thorough and specific. Use examples from your experience where relevant."
          rows={8}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
            padding: '14px 16px', color: '#f1f5f9', fontSize: '15px',
            outline: 'none', resize: 'vertical', lineHeight: '1.6',
            minHeight: '180px', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
          <p style={{ color: '#334155', fontSize: '12px' }}>
            {answer.length} characters · {answer.trim().split(/\s+/).filter(Boolean).length} words
          </p>
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            style={{
              background: answer.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: '12px',
              padding: '12px 32px', fontSize: '14px', fontWeight: '700',
              color: answer.trim() && !loading ? 'white' : '#334155',
              cursor: answer.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s',
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
