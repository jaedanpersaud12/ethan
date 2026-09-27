import type { MetadataRoute } from "next"
import { absolute, SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
        sitemap: absolute("/sitemap.xml"),
        host: SITE_URL,
    }
}
