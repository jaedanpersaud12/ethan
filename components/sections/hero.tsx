"use client"

import { ChromeFlow } from "@/components/custom/chrome-flow"
import { Clock } from "@/components/custom/clock"
import { EdgeBounce } from "@/components/edge-bounce/edge-bounce"

export function Hero() {
    return (
        <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
            <ChromeFlow className="absolute inset-0" fadeEdge={0.36} fadeWidth={0.2} dotSize={4} />

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pb-[8vh]">
                <EdgeBounce className="pointer-events-auto" distance={50} rotation={14} bounce={0.55}>
                    <img
                        src="/logo.png"
                        alt="Ethan Lalla — chrome wordmark"
                        className="float w-[70vw] max-w-[620px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)] md:w-[38vw]"
                        draggable={false}
                    />
                </EdgeBounce>
            </div>

            <div className="relative z-10 flex h-full flex-col justify-end gap-6 p-4 text-paper md:p-6">
                <h1 className="display text-[9vw] md:text-[6.2vw]">
                    Keep it simple,{" "}
                    <span className="font-serif font-normal normal-case italic tracking-normal text-lime">stupid.</span>
                </h1>
                <div className="label grid grid-cols-2 gap-4 border-t border-paper/25 pt-3 md:grid-cols-4">
                    <span>Graphic artist &amp; photographer</span>
                    <span className="hidden md:block">Posters, sleeves, type</span>
                    <span className="hidden md:block">
                        Port of Spain — <Clock />
                    </span>
                    <span className="text-right">Scroll ↓</span>
                </div>
            </div>
        </section>
    )
}
