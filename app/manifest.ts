import type { MetadataRoute } from "next"
import { INK, PAPER } from "@/lib/palette"
import { DESCRIPTION, PERSON, SITE_NAME } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: `${SITE_NAME} — ${PERSON}`,
        short_name: SITE_NAME,
        description: DESCRIPTION,
        start_url: "/",
        display: "standalone",
        background_color: PAPER,
        theme_color: INK,
        icons: [
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
            { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
        ],
    }
}
