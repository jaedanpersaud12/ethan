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
                        <ScrollShape name="orb" color="#ece9e1" turns={360} className="left-1/2 top-1/2 -ml-[26vw] -mt-[26vw] w-[52vw] opacity-10" wobble={false} />
                    </>
                }
            />
        </section>
    )
}
