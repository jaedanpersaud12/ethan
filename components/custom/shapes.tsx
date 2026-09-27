"use client"

/*
 * Background shapes in the spirit of the old ethanol site (pink starburst,
 * wireframe orb), redrawn, plus a few from his poster vocabulary.
 * Each one spins with page scroll through an underdamped spring, so it
 * lags, overshoots and settles instead of tracking the wheel 1:1.
 */

import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react"
import type { CSSProperties } from "react"

type ShapeName = "burst" | "orb" | "sparkle" | "flower" | "asterisk"

function burstPath(points: number, outer: number, inner: number, jitter: number) {
    // Deterministic jitter so SSR and client agree.
    let d = ""
    for (let i = 0; i < points * 2; i++) {
        const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
        const wobble = i % 2 === 0 ? 1 + Math.sin(i * 12.9898) * jitter : 1
        const r = (i % 2 === 0 ? outer : inner) * wobble
        d += `${i ? "L" : "M"}${(100 + Math.cos(a) * r).toFixed(2)} ${(100 + Math.sin(a) * r).toFixed(2)}`
    }
    return `${d}Z`
}

const BURST = burstPath(18, 98, 58, 0.08)

function flowerPath() {
    let d = ""
    const petals = 6
    for (let i = 0; i < petals; i++) {
        const a0 = (i / petals) * Math.PI * 2
        const a1 = ((i + 1) / petals) * Math.PI * 2
        const am = (a0 + a1) / 2
        const x0 = 100 + Math.cos(a0) * 42
        const y0 = 100 + Math.sin(a0) * 42
        const x1 = 100 + Math.cos(a1) * 42
        const y1 = 100 + Math.sin(a1) * 42
        const cx = 100 + Math.cos(am) * 140
        const cy = 100 + Math.sin(am) * 140
        d += `${i ? "" : `M${x0.toFixed(2)} ${y0.toFixed(2)}`}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`
    }
    return `${d}Z`
}

const FLOWER = flowerPath()

function Art({ name, color, stroke }: { name: ShapeName; color: string; stroke: string }) {
    switch (name) {
        case "burst":
            return <path d={BURST} fill={color} />
        case "orb":
            // Wireframe globe: tilted axis, meridians, latitudes, and an orbit
            // ring that breaks out of the sphere with a satellite on it.
            return (
                <g fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke">
                    <circle cx="100" cy="100" r="78" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <g transform="rotate(-20 100 100)">
                        {[78, 62, 40, 14].map((rx) => (
                            <ellipse key={rx} cx="100" cy="100" rx={rx} ry="78" vectorEffect="non-scaling-stroke" />
                        ))}
                        {[-0.72, -0.4, 0, 0.4, 0.72].map((s) => {
                            const y = 100 + s * 78
                            const rx = Math.sqrt(1 - s * s) * 78
                            return <ellipse key={s} cx="100" cy={y} rx={rx} ry={rx * 0.16} vectorEffect="non-scaling-stroke" />
                        })}
                        <line x1="100" y1="6" x2="100" y2="194" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
                    </g>
                    <g transform="rotate(24 100 100)">
                        <ellipse cx="100" cy="100" rx="99" ry="26" vectorEffect="non-scaling-stroke" />
                        <circle cx="199" cy="100" r="5" fill={color} />
                    </g>
                </g>
            )
        case "sparkle":
            return (
                <path
                    d="M100 0C104 60 140 96 200 100C140 104 104 140 100 200C96 140 60 104 0 100C60 96 96 60 100 0Z"
                    fill={color}
                />
            )
        case "flower":
            return (
                <g>
                    <path d={FLOWER} fill={color} stroke={stroke} strokeWidth="3" />
                    <circle cx="100" cy="100" r="22" fill={stroke} />
                </g>
            )
        case "asterisk":
            return (
                <g stroke={color} strokeWidth="26" strokeLinecap="round">
                    {[0, 30, 60, 90, 120, 150].map((r) => (
                        <line key={r} x1="100" y1="18" x2="100" y2="182" transform={`rotate(${r} 100 100)`} />
                    ))}
                </g>
            )
    }
}

type ScrollShapeProps = {
    name: ShapeName
    color?: string
    stroke?: string
    className?: string
    style?: CSSProperties
    /** Degrees of rotation across the whole page scroll. Negative spins the other way. */
    turns?: number
    /** Extra squash while scrolling fast. */
    wobble?: boolean
}

export function ScrollShape({
    name,
    color = "#ff8fc0",
    stroke = "#0c0c0b",
    className,
    style,
    turns = 540,
    wobble = true,
}: ScrollShapeProps) {
    const { scrollYProgress, scrollY } = useScroll()
    const raw = useTransform(scrollYProgress, [0, 1], [0, turns])
    // Underdamped: trails the scroll, swings past, settles.
    const rotate = useSpring(raw, { stiffness: 55, damping: 9, mass: 1.1 })
    const velocity = useSpring(useVelocity(scrollY), { stiffness: 200, damping: 30 })
    const scale = useTransform(velocity, [-4000, 0, 4000], wobble ? [0.88, 1, 0.88] : [1, 1, 1])

    return (
        <motion.svg
            aria-hidden
            viewBox="-4 -4 208 208"
            className={`pointer-events-none absolute select-none ${className ?? ""}`}
            style={{ rotate, scale, ...style }}
        >
            <Art name={name} color={color} stroke={stroke} />
        </motion.svg>
    )
}
