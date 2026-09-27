import { Footer } from "@/components/sections/footer"
import { Hero } from "@/components/sections/hero"
import { IndexList } from "@/components/sections/index-list"
import { Statement } from "@/components/sections/statement"
import { Swarm } from "@/components/sections/swarm"
import { Tobago } from "@/components/sections/tobago"

export default function Home() {
    return (
        <>
            <Hero />
            <Statement />
            <IndexList />
            <Swarm />
            <Tobago />
            <Footer />
        </>
    )
}
