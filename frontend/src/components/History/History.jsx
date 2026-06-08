import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function History({ onLoad }) {
  const isMobile = useIsMobile();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'sessions', id));
  };

  if (loading) return (
    <div style={{ padding: '20px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: '80px', marginBottom: '12px', borderRadius: '12px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
    </div>
  );

  if (sessions.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ fontSize: '40px', marginBottom: '14px' }}>📭</p>
      <p style={{ color: '#64748b', fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>No sessions yet</p>
      <p style={{ color: '#334155', fontSize: '13px' }}>Complete your first interview practice to see it here</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sessions.map(session => {
        const score = session.overallScore || 0;
        const scoreColor = score >= 8 ? '#4ade80' : score >= 6 ? '#fbbf24' : '#f87171';
        return (
          <div
            key={session.id}
            onClick={() => onLoad(session)}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: isMobile ? '12px 14px' : '16px 20px',
              display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            {/* Category icon */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>
              {session.categoryIcon || '🎯'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                {session.role}
              </p>
              <p style={{ color: '#475569', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{session.categoryLabel}</span>
                <span>•</span>
                <span>{session.difficulty}</span>
                {!isMobile && <><span>•</span><span>{session.totalQuestions} questions</span></>}
                <span>•</span>
                <span>{session.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(isMobile ? {} : { year: 'numeric' }) })}</span>
              </p>
            </div>

            {/* Score badge */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ color: scoreColor, fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{score}</p>
              <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600' }}>/10</p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => deleteSession(e, session.id)}
              style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                color: '#f87171', borderRadius: '8px', padding: '6px 12px',
                fontSize: '12px', fontWeight: '600', flexShrink: 0,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.stopPropagation(); e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
            >🗑</button>
          </div>
        );
      })}
    </div>
  );
}
