'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export function useAutoDismissError(delayMs = 4000) {
  const [error, setErrorState] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setError = useCallback((msg: string | null) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setErrorState(msg);
    if (msg) {
      timerRef.current = setTimeout(() => setErrorState(null), delayMs);
    }
  }, [delayMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { error, setError } as const;
}