"use client"

import { AnimatePresence, motion } from "motion/react"
import { startTransition, useMemo, useState, ViewTransition } from "react"
import { Lightbox, workTransitionName } from "@/components/custom/lightbox"
import type { Work } from "@/lib/works"

// Fold the specific kinds into a few filters people actually scan by.
const GROUP: Record<string, string> = {
    Poster: "Posters",
    Postcard: "Posters",
    "Cover Art": "Cover art",
    Tracklist: "Cover art",
    Layout: "Layout & type",
    "Type Study": "Layout & type",
    Editorial: "Layout & type",
    Illustration: "Drawing",
    "Mixed Media": "Drawing",
    Photography: "Photography",
}
const FILTERS = ["All", "Posters", "Cover art", "Layout & type", "Drawing", "Photography"]

export function ArchiveGrid({ works: ALL }: { works: Work[] }) {
    const [filter, setFilter] = useState("All")
    const [open, setOpen] = useState<number | null>(null)
    const works = useMemo(() => (filter === "All" ? ALL : ALL.filter((w) => GROUP[w.kind] === filter)), [filter])

    return (
        <section className="min-h-[100svh] px-4 pb-32 pt-32 md:px-6">
            <header className="mb-10 grid grid-cols-12 items-end gap-4">
                <span className="label col-span-12 md:col-span-3">
                    Archive — {String(works.length).padStart(2, "0")} of {ALL.length}
                </span>
                <h1 className="display col-span-12 text-[11vw] md:col-span-9 md:text-[5.6vw]">
                    Everything
                    <span className="whitespace-nowrap font-serif font-normal normal-case italic tracking-normal">
                        , so far
                    </span>
                </h1>
            </header>

            <div className="mb-8 flex flex-wrap gap-2 md:pl-[25%]" role="tablist" aria-label="Filter work">
                {FILTERS.map((f) => {
                    const on = f === filter
                    const count = f === "All" ? ALL.length : ALL.filter((w) => GROUP[w.kind] === f).length
                    return (
                        <button
                            key={f}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            onClick={() => setFilter(f)}
                            className={`label inline-flex min-h-11 items-center gap-2 rounded-full border px-4 transition-colors ${
                                on ? "border-ink bg-ink text-lime" : "border-ink/25 hover:border-ink"
                            }`}
                        >
                            {f}
                            <span className="opacity-50">{count}</span>
                        </button>
                    )
                })}
            </div>

            <motion.ul layout className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <AnimatePresence mode="popLayout" initial={false}>
                    {works.map((w, i) => (
                        <Tile
                            key={w.id}
                            work={w}
                            index={i}
                            open={open !== null && works[open]?.id === w.id}
                            onOpen={() => startTransition(() => setOpen(i))}
                        />
                    ))}
                </AnimatePresence>
            </motion.ul>

            <Lightbox works={works} index={open} onChange={setOpen} />
        </section>
    )
}

function Tile({ work, index, open, onOpen }: { work: Work; index: number; open: boolean; onOpen: () => void }) {
    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay: Math.min(index, 12) * 0.03 }}
        >
            <button
                type="button"
                onClick={onOpen}
                className="group relative block aspect-square w-full overflow-hidden bg-ink/5 text-left"
            >
                <span className="block size-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]">
                    {/* The open piece's tile unmounts its wrapper; the viewer's mounts. */}
                    {open ? (
                        <img src={work.src} alt={work.title} className="size-full object-cover" />
                    ) : (
                        <ViewTransition name={workTransitionName(work.id)} share="morph" default="none">
                            <img src={work.src} alt={work.title} loading="lazy" className="size-full object-cover" />
                        </ViewTransition>
                    )}
                </span>
                <span className="label absolute inset-x-0 bottom-0 flex translate-y-full items-baseline justify-between gap-2 bg-ink px-3 py-3 text-paper transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0">
                    <span className="truncate">{work.title}</span>
                    <span className="shrink-0 opacity-60">{work.year}</span>
                </span>
            </button>
        </motion.li>
    )
}
