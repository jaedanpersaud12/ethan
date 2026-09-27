/*
 * One place for everything search engines read: the canonical origin, who
 * Ethan is, what he does and where. Page metadata, the sitemap and the
 * JSON-LD in app/layout.tsx all pull from here so they never disagree.
 */

import type { Work } from "@/lib/works"

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")

export const SITE_NAME = "Ethanol"
export const PERSON = "Ethan Z. Lalla"
export const INSTAGRAM = "https://www.instagram.com/ethan.z.lalla/"

export const TAGLINE = "Graphic Designer, UI/UX Designer & Photographer in Trinidad and Tobago"

export const DESCRIPTION =
    "Ethan Z. Lalla is a graphic designer, UI/UX designer, illustrator and photographer based in Port of Spain, Trinidad and Tobago. Posters, album cover art, typography, branding, social media design, app and web interfaces, and photography, for clients across the Caribbean and worldwide."

/** What he's hired for. Also feeds schema.org `knowsAbout` and `hasOccupation`. */
export const SKILLS = [
    "Graphic design",
    "UI/UX design",
    "User interface design",
    "User experience design",
    "Product design",
    "Web design",
    "App design",
    "Figma",
    "Photography",
    "Portrait photography",
    "Event photography",
    "Illustration",
    "Poster design",
    "Album cover art",
    "Typography",
    "Type design",
    "Branding",
    "Logo design",
    "Visual identity",
    "Social media graphics",
    "Art direction",
    "Print design",
]

// Google ignores the keywords meta tag; Bing and smaller engines still glance at it.
// The ranking work is done by titles, descriptions, headings, alt text and JSON-LD.
export const KEYWORDS = [
    PERSON,
    "Ethan Lalla",
    "Ethanol",
    "Ethanol design",
    "graphic designer Trinidad",
    "graphic designer Trinidad and Tobago",
    "graphic designer Port of Spain",
    "graphic artist Trinidad",
    "Trinidad graphic artist",
    "Caribbean graphic designer",
    "UI/UX designer Trinidad",
    "UI designer Trinidad",
    "UX designer Trinidad and Tobago",
    "web designer Trinidad",
    "app designer Trinidad",
    "product designer Caribbean",
    "Figma designer Trinidad",
    "photographer Trinidad",
    "photographer Trinidad and Tobago",
    "photographer Port of Spain",
    "Tobago photographer",
    "Tobago photography",
    "Caribbean photographer",
    "freelance designer Trinidad",
    "freelance photographer Trinidad",
    "poster design Trinidad",
    "album cover artist Caribbean",
    "cover art designer",
    "typography",
    "branding Trinidad",
    "logo designer Trinidad",
    "social media designer Trinidad",
    "illustrator Trinidad",
    "Trinidad artist",
    "Trini artist",
    "TT designer",
    "art prints Trinidad",
    "design portfolio",
]

export const PLACE = {
    "@type": "Place",
    name: "Port of Spain, Trinidad and Tobago",
    address: {
        "@type": "PostalAddress",
        addressLocality: "Port of Spain",
        addressCountry: "TT",
    },
} as const

export function absolute(path: string) {
    return new URL(path, SITE_URL).toString()
}

/**
 * The site-wide graph: the person, the site, and the freelance practice.
 * Linked by @id so Google can build one knowledge-panel entity.
 */
export function siteJsonLd() {
    const person = absolute("/#person")
    const website = absolute("/#website")
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": person,
                name: PERSON,
                alternateName: ["Ethan Lalla", "Ethanol"],
                url: SITE_URL,
                image: absolute("/ethan.png"),
                description: DESCRIPTION,
                jobTitle: ["Graphic Designer", "UI/UX Designer", "Photographer"],
                hasOccupation: [
                    { "@type": "Occupation", name: "Graphic Designer", occupationLocation: { "@type": "Country", name: "Trinidad and Tobago" } },
                    { "@type": "Occupation", name: "UI/UX Designer", occupationLocation: { "@type": "Country", name: "Trinidad and Tobago" } },
                    { "@type": "Occupation", name: "Photographer", occupationLocation: { "@type": "Country", name: "Trinidad and Tobago" } },
                ],
                knowsAbout: SKILLS,
                homeLocation: PLACE,
                workLocation: PLACE,
                nationality: { "@type": "Country", name: "Trinidad and Tobago" },
                alumniOf: [{ "@type": "CollegeOrUniversity", name: "The University of the West Indies Open Campus" }],
                sameAs: [INSTAGRAM],
            },
            {
                "@type": "WebSite",
                "@id": website,
                url: SITE_URL,
                name: SITE_NAME,
                alternateName: `${PERSON} portfolio`,
                description: DESCRIPTION,
                inLanguage: "en-TT",
                author: { "@id": person },
                publisher: { "@id": person },
            },
            {
                "@type": "ProfessionalService",
                "@id": absolute("/#studio"),
                name: `${SITE_NAME} — ${PERSON}`,
                url: SITE_URL,
                image: absolute("/logo.png"),
                description: DESCRIPTION,
                founder: { "@id": person },
                areaServed: [
                    { "@type": "Country", name: "Trinidad and Tobago" },
                    { "@type": "Place", name: "Caribbean" },
                    { "@type": "Place", name: "Worldwide" },
                ],
                address: PLACE.address,
                knowsAbout: SKILLS,
                sameAs: [INSTAGRAM],
                hasOfferCatalog: {
                    "@type": "OfferCatalog",
                    name: "Design and photography services",
                    itemListElement: [
                        "Graphic design",
                        "UI/UX design",
                        "Poster and cover art design",
                        "Branding and logo design",
                        "Social media graphics",
                        "Photography",
                    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
                },
            },
        ],
    }
}

/** Serialise for a <script type="application/ld+json">, escaping `<` so a title can't close the tag. */
export function jsonLd(data: unknown) {
    return { __html: JSON.stringify(data).replace(/</g, "\\u003c") }
}

export function breadcrumbs(trail: [name: string, path: string][]) {
    return {
        "@type": "BreadcrumbList",
        itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absolute(path) })),
    }
}

/** A page of work as an image gallery, each piece a VisualArtwork credited to Ethan — with an Offer when it's for sale. */
export function galleryJsonLd(works: Work[], path: string, name: string) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        url: absolute(path),
        name: `${name} — ${PERSON}`,
        author: { "@id": absolute("/#person") },
        mainEntity: {
            "@type": "ImageGallery",
            name: `${PERSON} — graphic design and photography`,
            numberOfItems: works.length,
            itemListElement: works.map((w, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": "VisualArtwork",
                    name: w.title,
                    artform: w.kind,
                    dateCreated: w.year,
                    image: absolute(w.src),
                    creator: { "@id": absolute("/#person") },
                    locationCreated: { "@type": "Country", name: "Trinidad and Tobago" },
                    ...(w.price != null && {
                        offers: {
                            "@type": "Offer",
                            price: w.price,
                            priceCurrency: "TTD",
                            availability: w.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
                            url: absolute(path),
                        },
                    }),
                },
            })),
        },
    }
}

/** Alt text that says what and by whom — image search reads this more than anything else. */
export function workAlt(w: Pick<Work, "title" | "kind" | "year">) {
    return `${w.title}, ${w.kind.toLowerCase()} by ${PERSON} (${w.year}), Trinidad and Tobago`
}
