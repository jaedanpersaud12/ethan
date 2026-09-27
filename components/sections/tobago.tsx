"use client"

import ScatteredScroll from "@/components/scattered-scroll/scattered-scroll"
import { ScrollShape } from "@/components/custom/shapes"
import { TOBAGO } from "@/lib/works"

export function Tobago() {
    return (
        <section className="relative overflow-x-clip bg-sun text-ink">
            <ScrollShape name="flower" color="#ff8fc0" turns={-540} className="-right-[7vw] top-28 w-[15vw]" />
            <div className="relative grid grid-cols-12 gap-4 px-4 pt-32 md:px-6">
                <span className="label col-span-12 md:col-span-3">(04) — Photo series, 5 frames</span>
                <h2 className="col-span-12 text-[11vw] leading-[0.9] md:col-span-9 md:text-[6vw]">
                    <span className="font-serif italic">Tobago</span> <span className="display">Meditation</span>
                </h2>
                <p className="label col-span-12 max-w-sm md:col-span-4 md:col-start-4">
                    Gingerbread fretwork, jalousie windows and pastel walls, shot on slow afternoons and
                    printed like keepsakes.
                </p>
            </div>
            <ScatteredScroll overlap={80} scrollDistance={260}>
                {TOBAGO.map((w) => (
                    <img
                        key={w.id}
                        src={w.src}
                        alt={w.title}
                        className="aspect-square w-[46vw] object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] md:w-[24vw]"
                    />
                ))}
            </ScatteredScroll>
        </section>
    )
}
