"use client"

import ScatteredScroll from "@/components/scattered-scroll/scattered-scroll"
import { ScrollShape } from "@/components/custom/shapes"
import { FooterPixels } from "@/components/sections/footer"
import { PINK_SOFT } from "@/lib/palette"
import type { Work } from "@/lib/works"
import { workAlt } from "@/lib/seo"

export function Tobago({ works }: { works: Work[] }) {
    return (
        <section className="relative overflow-x-clip bg-sun text-ink">
            <ScrollShape name="asterisk" color={PINK_SOFT} turns={720} className="right-[4vw] top-10 hidden w-[4.5vw] md:block" />
            <div className="relative grid grid-cols-12 gap-4 px-4 pt-32 md:px-6">
                <span className="label col-span-12 md:col-span-3">(04) — Photo series, {works.length} {works.length === 1 ? "frame" : "frames"}</span>
                <h2 className="col-span-12 text-balance text-[9vw] leading-[0.9] md:col-span-9 md:text-[6vw]">
                    <span className="font-serif italic">Tobago</span> <span className="display">Meditation</span>
                </h2>
                <p className="label col-span-12 max-w-sm leading-[1.5] text-pretty md:col-span-4 md:col-start-4">
                    Gingerbread fretwork, jalousie windows and pastel walls, shot on slow afternoons and
                    printed like keepsakes.
                </p>
            </div>
            <ScatteredScroll overlap={100} scrollDistance={220}>
                {works.map((w) => (
                    <img
                        key={w.id}
                        src={w.src}
                        alt={workAlt(w)}
                        className="aspect-square w-[46vw] object-cover outline outline-1 -outline-offset-1 outline-black/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] md:w-[24vw]"
                    />
                ))}
            </ScatteredScroll>
            {/* Pulled up over the scatter's empty tail so the cover starts as the last frame leaves. */}
            <FooterPixels className="-mt-[140vh]" />
        </section>
    )
}
