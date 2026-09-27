import type { MetadataRoute } from "next"
import { publicWorks } from "@/lib/catalog"
import { absolute } from "@/lib/seo"

// Rebuilt with the site pages, so new pieces land in the image sitemap within the hour.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { index, tobago, all } = await publicWorks()
    const now = new Date()
    const images = (works: typeof all) => works.map((w) => absolute(w.src))
    return [
        { url: absolute("/"), lastModified: now, changeFrequency: "weekly", priority: 1, images: images([...index, ...tobago]) },
        { url: absolute("/archive"), lastModified: now, changeFrequency: "weekly", priority: 0.9, images: images(all) },
        { url: absolute("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.8, images: [absolute("/ethan.png")] },
    ]
}
