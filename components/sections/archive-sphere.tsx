"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { FluidDistortion } from "@/components/fluid-distortion/fluid-distortion"
import { SphereGallery } from "@/components/sphere-gallery/sphere-gallery"
import { TextScramble } from "@/components/text-scramble/text-scramble"
import { ALL } from "@/lib/works"

const ITEMS = ALL.map((w) => ({ src: w.src, alt: w.title }))

export function ArchiveSphere() {
    const [active, setActive] = useState<number | null>(null)
    const work = active !== null ? ALL[active % ALL.length] : null

    return (
        <section className="h-[100svh] overflow-hidden bg-ink text-paper" data-cursor={active === null ? "Drag" : undefined}>
            <FluidDistortion
                intensity={3}
                distortion={0.9}
                radius={0.35}
                force={1.4}
                curl={6}
                swirl={4}
                rainbow
            />
            <SphereGallery
                items={ITEMS}
                mode="texture"
                onActiveChange={setActive}
                className="fixed inset-0"
                tileColor="#ece9e1"
                sphereColor="#0c0c0b"
                rows={7}
                columns={12}
                cornerRadius={0.015}
                lensBlur={0.5}
            />

            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 grid grid-cols-12 items-end gap-4 p-4 mix-blend-difference md:p-6">
                <div className="col-span-12 md:col-span-8">
                    <AnimatePresence mode="wait">
                        {work ? (
                            <motion.div
                                key={work.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <p className="label mb-2">
                                    {work.kind} — {work.year}
                                </p>
                                <TextScramble render={<h1 className="display text-[8vw] md:text-[4.5vw]" />}>
                                    {work.title}
                                </TextScramble>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h1 className="display text-[10vw] md:text-[5.5vw]">
                                    Archive<span className="font-serif normal-case italic tracking-normal">, all of it</span>
                                </h1>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <p className="label col-span-12 md:col-span-4 md:text-right">
                    {ALL.length} pieces wrapped on a sphere
                    <br />
                    Drag to look · Scroll to zoom · Click to open
                </p>
            </div>
        </section>
    )
}
