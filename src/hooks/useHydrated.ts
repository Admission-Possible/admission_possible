import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during the prerender and on the first client render, true afterwards.
 *
 * Routes are prerendered in Node (#45), where there is no localStorage, so
 * anything whose markup depends on stored intake would render one way on the
 * server and another way on a returning student's first paint — a hydration
 * mismatch that makes React throw away the prerendered tree. Gating on this
 * keeps the first render identical to the server's, then enhances.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
