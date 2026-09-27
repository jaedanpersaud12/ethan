import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
    const mql = window.matchMedia(QUERY)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
}

/**
 * `prefers-reduced-motion: reduce`, hydration-safe. The server can't know the
 * preference, so it renders motion; this returns false while hydrating (to
 * match that) and the real value straight after. motion's useReducedMotion
 * reads the media query on the first client render, which mismatches.
 */
export function useReducedMotion() {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    )
}
