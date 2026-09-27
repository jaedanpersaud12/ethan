"use client"

import { useEffect, useRef } from "react"

/*
 * Blend-mode dot cursor. Position is written straight to the transform on
 * every pointer event (no spring, no React state), so it never trails the
 * real pointer. Only the size change over links is animated, in CSS.
 */
export function Cursor() {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
        document.documentElement.classList.add("has-cursor")

        const move = (e: PointerEvent) => {
            el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
            el.style.opacity = "1"
        }
        const over = (e: PointerEvent) => {
            const t = e.target as Element | null
            el.dataset.hover = t?.closest("a, button, [role='button']") ? "link" : ""
        }
        const leave = () => (el.style.opacity = "0")

        window.addEventListener("pointermove", move, { passive: true })
        window.addEventListener("pointerover", over, { passive: true })
        document.documentElement.addEventListener("pointerleave", leave)
        return () => {
            document.documentElement.classList.remove("has-cursor")
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerover", over)
            document.documentElement.removeEventListener("pointerleave", leave)
        }
    }, [])

    return (
        <div
            ref={ref}
            aria-hidden
            className="cursor pointer-events-none fixed left-0 top-0 z-[100] opacity-0 mix-blend-difference"
        >
            <span />
        </div>
    )
}
