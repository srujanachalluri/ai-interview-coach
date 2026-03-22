export default function SessionSummary({ summary, sessionData, onRestart, onHome }) {
  const { overall_score, performance_level, summary: text, top_strengths, key_improvements, recommended_topics, next_steps } = summary;

  const levelColor = performance_level === 'Ready to Interview' ? '#4ade80' : performance_level === 'Almost Ready' ? '#fbbf24' : '#f87171';
  const levelBg = performance_level === 'Ready to Interview' ? 'rgba(74,222,128,0.1)' : performance_level === 'Almost Ready' ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';

  const downloadReport = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const el = document.getElementById('session-report');
    await html2pdf().set({
      margin: 10, filename: 'interview-report.pdf',
      html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' },
    }).from(el).save();
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
            background: `conic-gradient(${levelColor} ${overall_score * 36}deg, rgba(255,255,255,0.06) 0deg)`,
            boxShadow: `0 0 30px ${levelColor}40`,
          }}>
            <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: '#0f0f1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: levelColor, fontSize: '18px', fontWeight: '800' }}>{overall_score}</span>
              <span style={{ color: '#475569', fontSize: '10px' }}>/10</span>
            </div>
          </div>
          <p style={{ color: levelColor, fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>{performance_level}</p>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>{text}</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: levelColor, fontSize: '22px', fontWeight: '800' }}>{overall_score}/10</p>
              <p style={{ color: '#475569', fontSize: '12px' }}>Avg Score</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#818cf8', fontSize: '22px', fontWeight: '800' }}>{sessionData.answers?.length || 0}</p>
              <p style={{ color: '#475569', fontSize: '12px' }}>Questions</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: '800' }}>{sessionData.category?.label}</p>
              <p style={{ color: '#475569', fontSize: '12px' }}>Category</p>
            </div>
          </div>
        </div>

        {/* Strengths + Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🏆 Top Strengths</p>
            {(top_strengths || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{s}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ color: '#f87171', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📈 Key Improvements</p>
            {(key_improvements || []).map((imp, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#f87171', flexShrink: 0 }}>→</span>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{imp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Topics */}
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: '#818cf8', fontWeight: '700', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📚 Recommended Study Topics</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(recommended_topics || []).map(t => (
              <span key={t} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', fontSize: '13px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
          <p style={{ color: '#fbbf24', fontWeight: '700', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ Next Steps</p>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7' }}>{next_steps}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={downloadReport} style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
          borderRadius: '12px', padding: '12px 28px', fontSize: '14px', fontWeight: '700',
          color: 'white', cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
        }}>📥 Download Report</button>
        <button onClick={onRestart} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '12px 28px', fontSize: '14px', fontWeight: '700',
          color: '#f1f5f9', cursor: 'pointer', transition: 'all 0.2s',
        }}>🔄 Practice Again</button>
        <button onClick={onHome} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '12px 28px', fontSize: '14px', fontWeight: '700',
          color: '#f1f5f9', cursor: 'pointer', transition: 'all 0.2s',
        }}>🏠 Home</button>
      </div>
    </div>
  );
}
