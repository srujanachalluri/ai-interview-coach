import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport is at or below `breakpoint` px.
 * Drives the app's responsive (mobile-first) layout decisions.
 */
export function useIsMobile(breakpoint = 768) {
  const get = () =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false;

  const [isMobile, setIsMobile] = useState(get);

  useEffect(() => {
    const onResize = () => setIsMobile(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakpoint]);

  return isMobile;
}
