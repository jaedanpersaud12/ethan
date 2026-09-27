"use client"

import { motion, useMotionValue, useSpring } from "motion/react"
import { useEffect, useState } from "react"

/* Blend-mode cursor that grows and labels itself over [data-cursor] targets. */
export function Cursor() {
    const x = useMotionValue(-100)
    const y = useMotionValue(-100)
    const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 })
    const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 })
    const [label, setLabel] = useState<string | null>(null)
    const [link, setLink] = useState(false)

    useEffect(() => {
        const move = (e: PointerEvent) => {
            x.set(e.clientX)
            y.set(e.clientY)
            const t = e.target as HTMLElement | null
            const tagged = t?.closest<HTMLElement>("[data-cursor]")
            setLabel(tagged?.dataset.cursor ?? null)
            setLink(!!t?.closest("a,button"))
        }
        window.addEventListener("pointermove", move)
        return () => window.removeEventListener("pointermove", move)
    }, [x, y])

    const size = label ? 96 : link ? 44 : 14
    return (
        <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center rounded-full bg-white mix-blend-difference [@media(hover:hover)]:flex"
            style={{ x: sx, y: sy, translate: "-50% -50%" }}
            animate={{ width: size, height: size }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
            {label && <span className="label text-[10px] text-black">{label}</span>}
        </motion.div>
    )
}
