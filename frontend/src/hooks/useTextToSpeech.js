import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Web Speech API (SpeechSynthesis) wrapper so the interviewer can read
 * questions aloud. Returns { supported, speaking, muted, speak, cancel, toggleMute }.
 * The mute preference is persisted so it survives reloads.
 */
export function useTextToSpeech() {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const supported = !!synth;

  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem('aic_tts_muted') === '1'; } catch { return false; }
  });
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const voiceRef = useRef(null);

  // Voices load asynchronously in most browsers — grab a natural English one when ready.
  useEffect(() => {
    if (!synth) return;
    const pick = () => {
      const voices = synth.getVoices();
      if (!voices.length) return;
      voiceRef.current =
        voices.find(v => /en[-_]US/i.test(v.lang) && /(Google|Samantha|Natural|Aria|Zira|Jenny)/i.test(v.name)) ||
        voices.find(v => /en[-_]US/i.test(v.lang)) ||
        voices.find(v => /^en/i.test(v.lang)) ||
        null;
    };
    pick();
    synth.addEventListener?.('voiceschanged', pick);
    return () => synth.removeEventListener?.('voiceschanged', pick);
  }, [synth]);

  const cancel = useCallback(() => {
    if (!synth) return;
    try { synth.cancel(); } catch { /* noop */ }
    setSpeaking(false);
  }, [synth]);

  const speak = useCallback((text) => {
    if (!synth || !text || mutedRef.current) return;
    try { synth.cancel(); } catch { /* noop */ }
    const u = new SpeechSynthesisUtterance(String(text));
    u.rate = 1.0;
    u.pitch = 1.0;
    u.lang = 'en-US';
    if (voiceRef.current) u.voice = voiceRef.current;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    try { synth.speak(u); } catch { /* noop */ }
  }, [synth]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m;
      try { localStorage.setItem('aic_tts_muted', next ? '1' : '0'); } catch { /* noop */ }
      if (next && synth) { try { synth.cancel(); } catch { /* noop */ } setSpeaking(false); }
      return next;
    });
  }, [synth]);

  // Stop any speech if the component using this unmounts.
  useEffect(() => () => { if (synth) { try { synth.cancel(); } catch { /* noop */ } } }, [synth]);

  return { supported, speaking, muted, speak, cancel, toggleMute };
}
