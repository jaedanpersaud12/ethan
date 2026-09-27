"use client"

import { ScrollShape } from "@/components/custom/shapes"
import { LetterSwarm } from "@/components/custom/letter-swarm"

export function Swarm() {
    return (
        <section className="relative bg-ink text-paper">
            <p className="label absolute left-4 top-24 z-10 text-paper/60 md:left-6">(03) — Manifesto</p>
            <LetterSwarm
                lines={["Art is", "for", "everyone"]}
                decor={
                    <>
                        <ScrollShape name="sparkle" color="#dcf26b" turns={1080} className="left-[8vw] top-[18vh] w-[7vw]" />
                        <ScrollShape name="sparkle" color="#ff5fae" turns={-720} className="bottom-[14vh] right-[10vw] w-[5vw]" />
                        <ScrollShape name="orb" color="#ece9e1" turns={360} className="left-1/2 top-1/2 -ml-[30vw] -mt-[30vw] w-[60vw] opacity-15" wobble={false} />
                    </>
                }
            />
        </section>
    )
}
