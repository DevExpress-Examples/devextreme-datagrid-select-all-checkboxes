import { useRef, useLayoutEffect, useCallback } from 'react';

export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
): (...args: Args) => Return {
  // eslint-disable-next-line @typescript-eslint/no-extra-parens, no-unused-vars
  const ref = useRef<((...args: Args) => Return) | null>(null);

  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: Args) => {
    const f = ref.current;
    if (!f) {
      throw new Error('Cannot call function before component is mounted');
    }
    return f(...args);
  }, []);
}
