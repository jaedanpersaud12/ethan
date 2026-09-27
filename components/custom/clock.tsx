"use client"

import { useEffect, useState } from "react"

export function Clock() {
    const [now, setNow] = useState<string>("--:--:--")
    useEffect(() => {
        const fmt = new Intl.DateTimeFormat("en-GB", {
            timeZone: "America/Port_of_Spain",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
        const tick = () => setNow(fmt.format(new Date()))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])
    return <span suppressHydrationWarning>{now} AST</span>
}
