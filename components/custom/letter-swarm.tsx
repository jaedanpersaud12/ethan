"use client"

/*
 * Hand-built stand-in for Atelier's pro Letter Swarm: letters start
 * scattered, gather into a line as the section pins, then blow apart again.
 */

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { type MotionValue, motion, useScroll, useSpring, useTransform } from "motion/react"
import { useMemo, useRef } from "react"
import { LIME, PAPER, PINK } from "@/lib/palette"

type Scatter = { x: number; y: number; r: number; s: number; x2: number; y2: number; r2: number }

function seeded(seed: number) {
    let s = seed
    return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

export function LetterSwarm({
    lines,
    className,
    decor,
}: {
    lines: string[]
    className?: string
    decor?: React.ReactNode
}) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
    const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 })
    // Under reduced motion the words sit assembled; nothing flies in or out.
    const still = useReducedMotion()

    const scatter = useMemo(() => {
        const rand = seeded(7)
        return lines.map((line) =>
            Array.from(line).map<Scatter>(() => ({
                x: (rand() - 0.5) * 120,
                y: (rand() - 0.5) * 140,
                r: (rand() - 0.5) * 220,
                s: 0.4 + rand() * 1.8,
                x2: (rand() - 0.5) * 160,
                y2: -40 - rand() * 90,
                r2: (rand() - 0.5) * 300,
            })),
        )
    }, [lines])

    return (
        <div ref={ref} className={`relative h-[220vh] ${className ?? ""}`}>
            <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
                {decor}
                <h2 className="sr-only">{lines.join(" ")}</h2>
                {lines.map((line, li) => (
                    <div key={li} aria-hidden className="display relative flex text-[11vw] md:text-[9vw]">
                        {Array.from(line).map((ch, i) => (
                            <Letter key={i} ch={ch} s={scatter[li][i]} progress={progress} still={still} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

function Letter({ ch, s, progress, still }: { ch: string; s: Scatter; progress: MotionValue<number>; still: boolean }) {
    const stops = [0, 0.38, 0.62, 1]
    const x = useTransform(progress, stops, [`${s.x}vw`, "0vw", "0vw", `${s.x2}vw`])
    const y = useTransform(progress, stops, [`${s.y}vh`, "0vh", "0vh", `${s.y2}vh`])
    const rotate = useTransform(progress, stops, [s.r, 0, 0, s.r2])
    const scale = useTransform(progress, stops, [s.s, 1, 1, s.s * 0.6])
    const color = useTransform(progress, [0.3, 0.4, 0.6, 0.7], [PAPER, LIME, LIME, PINK])
    if (still) return <span className="inline-block text-lime">{ch === " " ? " " : ch}</span>
    return (
        <motion.span className="inline-block will-change-transform" style={{ x, y, rotate, scale, color }}>
            {ch === " " ? " " : ch}
        </motion.span>
    )
}
