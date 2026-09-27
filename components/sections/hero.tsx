"use client"

import { Clock } from "@/components/custom/clock"
import { DitherField } from "@/components/custom/dither-field"
import { EdgeBounce } from "@/components/edge-bounce/edge-bounce"

export function Hero() {
    return (
        <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
            {/* Everything marked data-calm gets a clearing in the dither. */}
            <DitherField className="relative h-full">
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pb-[10vh]">
                    <EdgeBounce className="pointer-events-auto" distance={50} rotation={14} bounce={0.55}>
                        <img
                            src="/logo.png"
                            alt="Ethanol — Ethan Z. Lalla, graphic designer and photographer"
                            className="float w-[70vw] max-w-[620px] md:w-[38vw]"
                            draggable={false}
                        />
                    </EdgeBounce>
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end p-4 text-ink md:p-6">
                    <div data-calm="16" className="flex flex-col gap-6">
                        <h1 className="display self-start text-balance text-[9vw] md:text-[6.2vw]">
                            Keep it simple,{" "}
                            <span className="font-serif font-normal normal-case italic tracking-normal">stupid.</span>
                        </h1>
                        <div className="label grid grid-cols-2 gap-4 border-t border-ink/30 pt-3 md:grid-cols-4">
                            <span>Graphic designer, UI/UX &amp; photographer</span>
                            <span className="hidden md:block">Posters, sleeves, type</span>
                            <span className="hidden md:block">
                                Port of Spain — <Clock />
                            </span>
                            <span className="text-right">Scroll ↓</span>
                        </div>
                    </div>
                </div>
            </DitherField>
        </section>
    )
}
