"use client"

import { ScrollShape } from "@/components/custom/shapes"
import { PixelatedText } from "@/components/pixelated-text/pixelated-text"
import { TextScramble } from "@/components/text-scramble/text-scramble"

export function Statement() {
    return (
        <section className="relative grid grid-cols-12 gap-4 overflow-hidden px-4 py-32 md:px-6 md:py-48">
            <ScrollShape name="burst" color="#ff8fc0" turns={540} className="-right-[9vw] top-1/2 w-[18vw] -translate-y-1/2" />
            <div className="label relative col-span-12 flex flex-col gap-1 md:col-span-3">
                <TextScramble>(01) — Hello</TextScramble>
                <span className="opacity-50">23 / Gemini / 5&apos;9&quot;</span>
            </div>
            <p className="relative col-span-12 text-[7.5vw] leading-[1.02] tracking-tight md:col-span-9 md:text-[4vw]">
                <span className="display text-[0.72em]">Ethan</span>{" "}
                <span className="font-serif italic">makes posters, cover art, type &amp; photographs</span>{" "}
                <span className="display text-[0.72em]">in Trinidad</span>{" "}
                <span className="font-serif italic">— and can only work on</span>{" "}
                <PixelatedText
                    render={<span className="display text-[0.72em] text-ink" />}
                    pixelSize={6}
                    colors={["#ff5fae", "#c9a2ff", "#1fb58f"]}
                >
                    interesting things.
                </PixelatedText>
            </p>
        </section>
    )
}
