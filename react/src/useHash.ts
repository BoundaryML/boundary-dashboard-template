import { useSyncExternalStore } from 'react';

// The page's `#` is the dashboard's place. Boundary keeps it in its own URL, so a copied link
// opens the dashboard where it was, and back and forward move through it.

const subscribe = (listener: () => void) => {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
};

/** The place the dashboard is at: the `#` without the `#`, for example `/failed`. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash.replace(/^#/, ''));
}

/**
 * Moves the dashboard to a place. Call it from a click handler: a plain `<a href="#...">` would
 * navigate the frame away.
 */
export function goTo(place: string): void {
  window.location.hash = place;
}
