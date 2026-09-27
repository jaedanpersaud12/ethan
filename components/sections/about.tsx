"use client"

import { DitherField } from "@/components/custom/dither-field"
import { ScrollShape } from "@/components/custom/shapes"
import { EdgeBounce } from "@/components/edge-bounce/edge-bounce"
import { LiquidMedia } from "@/components/liquid-media/liquid-media"
import { PixelTrail } from "@/components/pixel-trail/pixel-trail"
import { TextScramble } from "@/components/text-scramble/text-scramble"

const STATS = [
    ["Age", "23"],
    ["Height", "5'9\""],
    ["Home", "Trinidad & Tobago"],
    ["Sign", "Gemini"],
]

const LIKES: { group: string; color: string; items: string[] }[] = [
    {
        group: "Music",
        color: "#dcf26b",
        items: ["Linkin Park", "JID", "Pearl Jam", "Kendrick", "ALI", "Radiohead", "Gorillaz", "Kes", "Foo Fighters"],
    },
    {
        group: "Anime / Manga",
        color: "#c9a2ff",
        items: ["Bleach", "Vagabond", "20th Century Boys", "Undead Unluck", "Re:Zero", "Solo Leveling", "Frieren", "Blue Exorcist"],
    },
    {
        group: "Games",
        color: "#ff5fae",
        items: ["Borderlands", "Midnight Club", "EA FC", "Rainbow 6 Siege", "Minecraft", "Ghost of Tsushima", "Cyberpunk 2077"],
    },
]

const PROS = ["Figma master", "Fast learner", "Good with hands", "Outside-the-box thinker"]
const CONS = ["Only works on interesting things", "Almost always sick", "Gets bored easy", "Overthinks"]
const DISLIKES = ["Loud people", "You (jk)", "Callaloo", "Noise", "Sticky floors", "Messy rooms", "You again"]

const EXPERIENCE = [
    ["2015 —", "Decorative Assistant", "Taurean Design Studios"],
    ["", "Volunteer", "Think Art Work TT Studios"],
    ["", "Freelance Designer", "Independent"],
    ["", "Social Media Graphic Designer", "Zed Labs"],
    ["", "UI/UX Designer", "Zed Labs for Wam Now, Inc."],
    ["", "Freelance Photographer", "Independent"],
]
const EDUCATION = [
    ["2018 — 2020", "Photography Level 1 — Grade A", "UWI Open Campus"],
    ["", "Photography Level 2 — Grade A", "UWI Open Campus"],
    ["", "Media Arts Summer Program", "Miami International University of Art & Design"],
]

export function About() {
    return (
        <>
            <section className="relative min-h-[100svh] overflow-hidden">
                <DitherField className="relative min-h-[100svh]" colors={["#c9a2ff", "#8fd3ff", "#dcf26b", "#f4d35e"]}>
                    <div className="relative z-10 grid min-h-[100svh] grid-cols-12 items-end gap-4 px-4 pb-6 pt-32 md:px-6">
                        <h1 data-calm="18" className="display col-span-12 self-end text-[10vw] md:col-span-8 md:text-[6.5vw] text-ink">
                            Some things
                            <br />
                            <span className="font-serif font-normal normal-case italic tracking-normal">about me</span> :)
                        </h1>
                        <dl data-calm="14" className="label col-span-12 grid grid-cols-2 gap-x-4 gap-y-3 text-ink md:col-span-4">
                            {STATS.map(([k, v]) => (
                                <div key={k} className="border-t border-ink/30 pt-2">
                                    <dt className="opacity-60">{k}</dt>
                                    <dd className="display text-[4.5vw] md:text-[1.4vw]">
                                        <TextScramble>{v}</TextScramble>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </DitherField>
            </section>

            <section className="relative grid grid-cols-12 gap-4 overflow-x-clip px-4 py-24 md:px-6">
                <ScrollShape name="flower" color="#dcf26b" turns={720} className="-right-[8vw] top-[42%] w-[14vw]" />
                <ScrollShape name="burst" color="#c9a2ff" turns={-720} className="-left-[7vw] bottom-[6%] w-[16vw]" />
                <div className="relative col-span-12 md:sticky md:top-24 md:col-span-5 md:self-start">
                    <div className="border border-ink p-6">
                        <LiquidMedia
                            type="image"
                            src="/ethan.png"
                            alt="Illustrated self-portrait of Ethan throwing up a peace sign"
                            className="mx-auto h-[70vh] w-auto object-contain"
                            intensity={0.35}
                            radius={16}
                        />
                    </div>
                    <p className="label mt-3 flex justify-between">
                        <span>Self-portrait, drawn by hand</span>
                        <span className="opacity-50">Hover to ripple</span>
                    </p>
                </div>

                <div className="relative col-span-12 flex flex-col gap-24 md:col-span-6 md:col-start-7">
                    <Block title="Likes">
                        <div className="flex flex-col gap-8">
                            {LIKES.map((g) => (
                                <div key={g.group}>
                                    <p className="label mb-3 opacity-60">{g.group}</p>
                                    <ul className="flex flex-wrap gap-2">
                                        {g.items.map((it) => (
                                            <li key={it}>
                                                <EdgeBounce distance={30} rotation={20}>
                                                    <span
                                                        className="label inline-block rounded-full border border-ink px-3 py-2"
                                                        style={{ background: g.color }}
                                                    >
                                                        {it}
                                                    </span>
                                                </EdgeBounce>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </Block>

                    <Block title="Pros / Cons">
                        <div className="grid grid-cols-2 gap-4">
                            <ul className="flex flex-col gap-2">
                                {PROS.map((p) => (
                                    <li key={p} className="border-t border-ink pt-2 font-serif text-2xl italic md:text-3xl">
                                        + {p}
                                    </li>
                                ))}
                            </ul>
                            <ul className="flex flex-col gap-2">
                                {CONS.map((p) => (
                                    <li key={p} className="border-t border-ink pt-2 font-serif text-2xl italic opacity-60 md:text-3xl">
                                        − {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Block>

                    <Block title="Dislikes">
                        <ul className="display flex flex-wrap gap-x-4 text-[5.5vw] leading-tight md:text-[2vw]">
                            {DISLIKES.map((d) => (
                                <li key={d} className="line-through decoration-pink decoration-4">
                                    {d}
                                </li>
                            ))}
                        </ul>
                    </Block>

                    <Block title="Experience">
                        <Rows rows={EXPERIENCE} />
                    </Block>
                    <Block title="Education">
                        <Rows rows={EDUCATION} />
                    </Block>
                </div>
            </section>

            <section className="relative flex h-[80vh] items-center justify-center overflow-hidden bg-ink text-paper">
                <PixelTrail
                    className="absolute inset-0 h-full w-full"
                    color="#dcf26b"
                    pixelSize={24}
                    trailRadius={2}
                    lifetime={1.4}
                />
                <p className="pointer-events-none relative text-center text-[9vw] leading-[0.95] mix-blend-difference md:text-[5vw]">
                    <span className="font-serif italic">paint over</span>
                    <br />
                    <span className="display">this bit</span>
                </p>
            </section>
        </>
    )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <TextScramble render={<h2 className="display mb-6 border-b border-ink pb-2 text-[7vw] md:text-[2.6vw]" />}>
                {title}
            </TextScramble>
            {children}
        </div>
    )
}

function Rows({ rows }: { rows: string[][] }) {
    return (
        <ul>
            {rows.map(([when, role, where], i) => (
                <li key={i} className="label grid grid-cols-12 gap-2 border-b border-ink/20 py-3">
                    <span className="col-span-3 opacity-60">{when}</span>
                    <span className="col-span-5">{role}</span>
                    <span className="col-span-4 text-right opacity-60">{where}</span>
                </li>
            ))}
        </ul>
    )
}
