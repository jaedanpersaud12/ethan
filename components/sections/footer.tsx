"use client"

import { ScrollShape } from "@/components/custom/shapes"
import { MagneticDotGrid } from "@/components/magnetic-dot-grid/magnetic-dot-grid"
import PixelScroll from "@/components/pixel-scroll/pixel-scroll"
import { TextBounce } from "@/components/text-bounce/text-bounce"
import { TransitionLink } from "@/components/custom/pixel-transition"
import { TextRoll } from "@/components/custom/text-roll"

export function Footer() {
    return (
        <>
            <PixelScroll
                colors={["#dcf26b", "#ff5fae", "#c9a2ff", "#1fb58f"]}
                colorRatio={0.35}
                density={22}
                scrollDistance={140}
                className="bg-paper text-ink"
            />
            <footer className="relative -mt-px overflow-hidden bg-ink text-paper">
                <MagneticDotGrid
                    className="absolute inset-0 h-full w-full"
                    baseColor="#3a3a36"
                    centerColors={["#dcf26b", "#ff5fae", "#c9a2ff"]}
                    spacing={18}
                    dotRadius={1}
                    strength={28}
                    interactionRadius={260}
                />
                <ScrollShape name="orb" color="#ece9e1" turns={-540} className="-right-[12vw] top-[6vh] w-[30vw] opacity-25" wobble={false} />
                <div className="pointer-events-none relative grid min-h-[100svh] grid-rows-[1fr_auto] gap-10 px-4 pb-4 pt-32 md:px-6">
                    <div className="grid grid-cols-12 gap-4">
                        <span className="label col-span-12 text-paper/60 md:col-span-3">(07) — Contact</span>
                        <div className="col-span-12 md:col-span-9">
                            <p className="text-[8vw] leading-[1] md:text-[4.4vw]">
                                <span className="font-serif italic">Got something</span>{" "}
                                <span className="display text-lime">interesting?</span>
                            </p>
                            <div className="label pointer-events-auto mt-10 flex flex-wrap gap-x-10 gap-y-3">
                                <a
                                    className="group"
                                    href="https://www.instagram.com/ethan.z.lalla/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <TextRoll>→ DM @ethan.z.lalla</TextRoll>
                                </a>
                                <a className="group" href="https://www.zed.io/" target="_blank" rel="noreferrer">
                                    <TextRoll>Zed Labs ↗</TextRoll>
                                </a>
                                <a className="group" href="https://wam.money/" target="_blank" rel="noreferrer">
                                    <TextRoll>Wam ↗</TextRoll>
                                </a>
                                <TransitionLink className="group" href="/about">
                                    <TextRoll>About him →</TextRoll>
                                </TransitionLink>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="display pointer-events-auto text-[14.5vw] leading-[0.85] text-paper">
                            <TextBounce render={<span />} distance={70} rotation={40}>
                                Ethanol
                            </TextBounce>
                        </h2>
                        <div className="label mt-4 flex justify-between text-paper/50">
                            <span>Ethan Z. Lalla ©{new Date().getFullYear()}</span>
                            <span>Trinidad &amp; Tobago</span>
                            <span>Built with Atelier UI + a few homemade shaders</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
