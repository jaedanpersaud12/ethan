"use client"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import type { LenisOptions } from "lenis"
import { type LenisRef, ReactLenis } from "lenis/react"
import { cancelFrame, type FrameData, frame } from "motion"
import { type ReactNode, useEffect, useRef } from "react"

type SmoothScrollProps = {
    children: ReactNode
    options?: LenisOptions
}

/**
 * Smooth scroll for the whole page (for now).
 *
 * Motion is the clock: scroll, animations, and WebGL usually each run on
 * their own loop, and can fall out of sync. This provider runs them on a
 * single loop, in a fixed order, so they always move together.
 */
export function SmoothScroll({ children, options }: SmoothScrollProps) {
    const lenisRef = useRef<LenisRef>(null)
    // Reduced motion keeps Lenis (for scrollTo) but scrolls natively, 1:1.
    const reduced = useReducedMotion()

    useEffect(() => {
        function update(data: FrameData) {
            lenisRef.current?.lenis?.raf(data.timestamp)
        }
        frame.update(update, true)
        return () => cancelFrame(update)
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{
                syncTouch: true,
                ...options,
                ...(reduced && { smoothWheel: false, syncTouch: false }),
                autoRaf: false,
            }}>
            {children}
        </ReactLenis>
    )
}
