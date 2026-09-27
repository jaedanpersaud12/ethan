"use client"

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react"
import { useEffect, useState } from "react"
import { ScrollShape } from "@/components/custom/shapes"
import { WORKS } from "@/lib/works"

/*
 * The one place the home page lists the work. Hovering a row shows that
 * row's piece following the cursor; clicking opens it full size.
 */
export function IndexList() {
    const [active, setActive] = useState<number | null>(null)
    const [open, setOpen] = useState<number | null>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.5 })
    const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.5 })

    useEffect(() => {
        if (open === null) return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open])

    const current = active !== null ? WORKS[active] : null
    const opened = open !== null ? WORKS[open] : null

    return (
        <section className="px-4 pb-32 md:px-6">
            <header className="relative mb-8 grid grid-cols-12 items-end gap-4 border-t border-ink pt-3">
                <ScrollShape name="orb" color="#0c0c0b" turns={-540} className="bottom-[-1vw] right-[3vw] hidden w-[13vw] md:block" wobble={false} />
                <span className="label relative col-span-12 md:col-span-3">(02) — Work, {WORKS.length} pieces</span>
                <h2 className="display relative col-span-12 text-[12vw] md:col-span-9 md:text-[7vw]">Index</h2>
            </header>

            <ul
                className="border-t border-ink"
                onPointerMove={(e) => {
                    x.set(e.clientX)
                    y.set(e.clientY)
                }}
                onPointerLeave={() => setActive(null)}
            >
                {WORKS.map((w, i) => {
                    const on = active === i
                    return (
                        <li key={w.id}>
                            <button
                                type="button"
                                onPointerEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                onClick={() => setOpen(i)}
                                data-cursor="Open"
                                className={`grid w-full grid-cols-12 items-baseline gap-4 border-b border-ink px-2 py-4 text-left transition-colors duration-200 md:py-5 ${
                                    on ? "bg-ink text-lime" : ""
                                }`}
                            >
                                <span className="label col-span-2 md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                                <span className="display col-span-10 text-[5vw] md:col-span-6 md:text-[2vw]">
                                    {w.title}
                                </span>
                                <span className="label col-span-6 col-start-3 md:col-span-3 md:col-start-auto">
                                    {w.kind}
                                </span>
                                <span className="label col-span-4 text-right md:col-span-2">{w.year}</span>
                            </button>
                        </li>
                    )
                })}
            </ul>

            {/* Hover preview: exactly one image, the hovered row's. */}
            <motion.div
                aria-hidden
                className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
                style={{ x: sx, y: sy }}
            >
                <AnimatePresence>
                    {current && (
                        <motion.img
                            key={current.id}
                            src={current.src}
                            alt=""
                            className="absolute left-6 top-0 w-[22vw] max-w-[340px] -translate-y-1/2 object-cover shadow-2xl"
                            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                            transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {opened && (
                    <motion.div
                        className="fixed inset-0 z-[70] flex flex-col bg-ink/95 p-4 text-paper backdrop-blur md:p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(null)}
                        data-cursor="Close"
                        data-lenis-prevent
                    >
                        <div className="label flex justify-between pt-16">
                            <span>
                                {String((open ?? 0) + 1).padStart(2, "0")} — {opened.kind}, {opened.year}
                            </span>
                            <span>Esc / click to close</span>
                        </div>
                        <div className="flex min-h-0 flex-1 items-center justify-center py-6">
                            <motion.img
                                key={opened.id}
                                src={opened.src}
                                alt={opened.title}
                                className="max-h-full max-w-full object-contain"
                                initial={{ scale: 0.92, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                            />
                        </div>
                        <h3 className="display text-[7vw] md:text-[3.5vw]">{opened.title}</h3>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
