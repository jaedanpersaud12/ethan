"use client"

import { motion, useMotionValue, useSpring } from "motion/react"
import { startTransition, useEffect, useState, ViewTransition } from "react"
import { Lightbox, workTransitionName } from "@/components/custom/lightbox"
import { ScrollShape } from "@/components/custom/shapes"
import type { Work } from "@/lib/works"

/*
 * The one place the home page lists the work. Hovering a row shows that
 * row's piece following the cursor; clicking opens it full size.
 */
export function IndexList({ works: WORKS }: { works: Work[] }) {
    const [active, setActive] = useState<number | null>(null)
    const [open, setOpen] = useState<number | null>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.5 })
    const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.5 })

    // Scrolling moves the list out from under a still pointer without a
    // pointerleave, so drop the preview on scroll; moving re-activates it.
    useEffect(() => {
        const clear = () => setActive(null)
        window.addEventListener("scroll", clear, { passive: true })
        return () => window.removeEventListener("scroll", clear)
    }, [])

    // The preview stays mounted on the last hovered piece so it can hand its
    // image to the viewer (and take it back) through a shared transition name.
    const [last, setLast] = useState<number | null>(null)
    const [instant, setInstant] = useState(false)
    useEffect(() => {
        if (active !== null) setLast(active)
    }, [active])
    const preview = last !== null ? WORKS[last] : null
    const visible = active !== null && open === null

    return (
        <section className="px-4 pb-32 md:px-6">
            <header className="relative mb-8 grid grid-cols-12 items-end gap-4 border-t border-ink pt-3">
                <ScrollShape
                    name="orb"
                    color="#0c0c0b"
                    turns={-540}
                    className="bottom-[-1vw] right-[3vw] hidden w-[13vw] md:block"
                    wobble={false}
                />
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
                                onPointerEnter={() => {
                                    setInstant(false)
                                    setActive(i)
                                }}
                                onPointerMove={() => active !== i && setActive(i)}
                                onFocus={() => setActive(i)}
                                onClick={() => startTransition(() => setOpen(i))}
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
                {preview &&
                    (() => {
                        const img = (
                            <motion.img
                                key={preview.id}
                                src={preview.src}
                                alt=""
                                className={`absolute left-6 top-0 w-[22vw] max-w-[340px] -translate-y-1/2 object-cover shadow-2xl ${
                                    visible ? "opacity-100" : "opacity-0"
                                } ${instant || open !== null ? "" : "transition-opacity duration-150"}`}
                                initial={instant ? false : { scale: 0.85, rotate: -4 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                            />
                        )
                        // Only the visible preview mounts a named wrapper, so opening
                        // unmounts it (pairing with the viewer) and closing remounts it.
                        return visible ? (
                            <ViewTransition name={workTransitionName(preview.id)} share="morph" default="none">
                                {img}
                            </ViewTransition>
                        ) : (
                            img
                        )
                    })()}
            </motion.div>

            <Lightbox
                works={WORKS}
                index={open}
                onChange={setOpen}
                onClose={() => {
                    // Bring the preview back, instantly, as the landing spot.
                    setInstant(true)
                    setLast(open)
                    setActive(open)
                }}
            />
        </section>
    )
}
