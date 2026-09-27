"use client"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ScrollShape } from "@/components/custom/shapes"
import { PixelatedText } from "@/components/pixelated-text/pixelated-text"
import { TextScramble } from "@/components/text-scramble/text-scramble"
import { TEAL } from "@/lib/palette"

export function Statement() {
    const reduced = useReducedMotion()
    return (
        <section className="relative grid grid-cols-12 gap-4 overflow-hidden px-4 py-32 md:px-6 md:py-48">
            <ScrollShape name="burst" turns={540} className="-right-[11vw] bottom-[-4vw] w-[22vw]" />
            <ScrollShape name="sparkle" color={TEAL} turns={-900} className="bottom-[22%] left-[7vw] hidden w-[3.5vw] md:block" />
            <div className="label relative col-span-12 flex flex-col gap-1 md:col-span-3">
                <TextScramble playOnMount={!reduced} playOnHover={!reduced}>
                    (01) — Hello
                </TextScramble>
                <span className="opacity-60">23 / Gemini / 5′9″</span>
            </div>
            <p className="relative col-span-12 text-[7.5vw] leading-[1.15] tracking-tight text-pretty md:col-span-7 md:text-[3.6vw]">
                <span className="display text-[0.72em]">Ethan</span>{" "}
                <span className="font-serif italic">makes posters, cover art, type &amp; photographs</span>{" "}
                <span className="display text-[0.72em]">in Trinidad</span>{" "}
                <span className="font-serif italic">— and can only work on</span>{" "}
                {/* Ink, not the accents: pink, lilac and teal measure 1.7–2.3:1 on paper. */}
                {reduced ? (
                    <span className="display text-[0.72em] text-ink">interesting things.</span>
                ) : (
                    <PixelatedText render={<span className="display text-[0.72em] text-ink" />} pixelSize={6}>
                        interesting things.
                    </PixelatedText>
                )}
            </p>
        </section>
    )
}
