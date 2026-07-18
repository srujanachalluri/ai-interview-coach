import { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function SessionSummary({ summary, sessionData, onRestart, onHome }) {
  const isMobile = useIsMobile();
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);
  const { overall_score, performance_level, summary: text, top_strengths, key_improvements, recommended_topics, next_steps } = summary;

  const levelColor = performance_level === 'Ready to Interview' ? '#16a34a' : performance_level === 'Almost Ready' ? '#d97706' : '#dc2626';
  const levelBg = performance_level === 'Ready to Interview' ? 'rgba(74,222,128,0.1)' : performance_level === 'Almost Ready' ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const el = document.getElementById('session-report');
      await html2pdf().set({
        margin: 10, filename: 'interview-report.pdf',
        html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' },
      }).from(el).save();
    } finally {
      setDownloading(false);
    }
  };

  const shareResult = async () => {
    const role = sessionData.role || sessionData.category?.label || 'an interview';
    const shareText = `I just scored ${overall_score}/10 on a ${role} mock interview with AI Interview Coach 🎯 — practicing to land the job. Try it:`;
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AI Interview Coach', text: shareText, url });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div id="session-report">
        {/* Header */}
        <div style={{
          background: levelBg, border: `1px solid ${levelColor}40`,
          borderRadius: '20px', padding: '32px', marginBottom: '24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {performance_level === 'Ready to Interview' ? '🏆' : performance_level === 'Almost Ready' ? '🎯' : '📚'}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px',
            background: `conic-gradient(${levelColor} ${overall_score * 36}deg, #eef1f5 0deg)`,
            boxShadow: `0 0 30px ${levelColor}40`,
          }}>
            <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: levelColor, fontSize: '18px', fontWeight: '800' }}>{overall_score}</span>
              <span style={{ color: '#64748b', fontSize: '10px' }}>/10</span>
            </div>
          </div>
          <p style={{ color: levelColor, fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>{performance_level}</p>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>{text}</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: levelColor, fontSize: '22px', fontWeight: '800' }}>{overall_score}/10</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>Avg Score</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#4f46e5', fontSize: '22px', fontWeight: '800' }}>{sessionData.answers?.length || 0}</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>Questions</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#0f172a', fontSize: '22px', fontWeight: '800' }}>{sessionData.category?.label}</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>Category</p>
            </div>
          </div>
        </div>

        {/* Strengths + Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ color: '#16a34a', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🏆 Top Strengths</p>
            {(top_strengths || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>
                <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5' }}>{s}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ color: '#dc2626', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📈 Key Improvements</p>
            {(key_improvements || []).map((imp, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#dc2626', flexShrink: 0 }}>→</span>
                <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5' }}>{imp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Topics */}
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: '#4f46e5', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📚 Recommended Study Topics</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(recommended_topics || []).map(t => (
              <span key={t} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#4f46e5', fontSize: '13px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
          <p style={{ color: '#d97706', fontWeight: '700', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ Next Steps</p>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>{next_steps}</p>
        </div>
      </div>

      {/* Per-question review */}
      <QuestionReview answers={sessionData.answers || []} />

      {/* Action buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, auto)',
        gap: '10px', justifyContent: 'center',
      }}>
        <button onClick={shareResult} style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
          borderRadius: '12px', padding: '13px 22px', fontSize: '14px', fontWeight: '700',
          color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
        }}>{shared ? '✓ Copied!' : '📤 Share Result'}</button>
        <button onClick={downloadReport} disabled={downloading} style={{
          background: '#f1f5f9', border: '1px solid #dfe3ea',
          borderRadius: '12px', padding: '13px 22px', fontSize: '14px', fontWeight: '700',
          color: '#0f172a',
        }}>{downloading ? '⏳ Generating…' : '📥 Download PDF'}</button>
        <button onClick={onRestart} style={{
          background: '#f1f5f9', border: '1px solid #dfe3ea',
          borderRadius: '12px', padding: '13px 22px', fontSize: '14px', fontWeight: '700',
          color: '#0f172a',
        }}>🔄 Practice Again</button>
        <button onClick={onHome} style={{
          background: '#f1f5f9', border: '1px solid #dfe3ea',
          borderRadius: '12px', padding: '13px 22px', fontSize: '14px', fontWeight: '700',
          color: '#0f172a',
        }}>🏠 Home</button>
      </div>
    </div>
  );
}

// Collapsible review of each question, the candidate's answer, and AI feedback.
function QuestionReview({ answers }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  if (!answers.length) return null;

  const scoreColor = (s) => s >= 8 ? '#16a34a' : s >= 6 ? '#d97706' : s >= 4 ? '#f97316' : '#dc2626';

  return (
    <div style={{ marginBottom: '24px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
          background: '#ffffff', border: '1px solid #e2e6ec',
          borderRadius: '12px', padding: '14px 18px', color: '#0f172a',
          fontSize: '14px', fontWeight: '700', textAlign: 'left',
        }}
      >
        📋 Review all {answers.length} questions & answers
        <span style={{ marginLeft: 'auto', color: '#64748b' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {answers.map((a, i) => {
            const ev = a.evaluation || {};
            const isOpen = expanded === i;
            return (
              <div key={i} style={{ background: '#ffffff', border: '1px solid #e6e9ef', borderRadius: '12px', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'none', border: 'none', padding: '14px 16px', textAlign: 'left',
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: '34px', height: '34px', borderRadius: '8px',
                    background: 'rgba(99,102,241,0.12)', color: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 800,
                  }}>Q{i + 1}</span>
                  <span style={{ flex: 1, color: '#1e293b', fontSize: '13.5px', fontWeight: 600, lineHeight: 1.45 }}>
                    {a.question}
                  </span>
                  <span style={{ flexShrink: 0, color: scoreColor(a.score || 0), fontSize: '15px', fontWeight: 800 }}>
                    {a.score ?? '–'}<span style={{ color: '#94a3b8', fontSize: '11px' }}>/10</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="fade-in" style={{ padding: '0 16px 16px', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '14px 0 6px' }}>Your answer</p>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.answer}</p>
                    {ev.feedback && (<>
                      <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '14px 0 6px' }}>Feedback</p>
                      <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>{ev.feedback}</p>
                    </>)}
                    {ev.model_answer && (<>
                      <p style={{ color: '#4f46e5', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '14px 0 6px' }}>Model answer</p>
                      <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>{ev.model_answer}</p>
                    </>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
