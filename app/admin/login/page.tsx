import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
    const { next } = await searchParams
    return (
        <div className="studio on-ink grain flex min-h-dvh flex-col bg-ink px-4 py-4 text-paper md:px-6 md:py-5">
            <header className="label flex items-center justify-between">
                <span className="flex items-center gap-3">
                    <img src="/logo.png" alt="" className="h-7 w-auto" />
                    Ethanol <span className="text-lime">/ Studio</span>
                </span>
                <Link href="/" className="inline-flex min-h-10 items-center opacity-70 transition-opacity hover:opacity-100">
                    Back to the site ↗
                </Link>
            </header>

            <main className="grid flex-1 content-center">
                <p className="label mb-4 opacity-70">(Private) — for Ethan only</p>
                <h1 className="text-[16vw] leading-[0.85] text-balance md:text-[11vw]">
                    <span className="display">Studio</span>
                    <span className="font-serif text-lime italic">, open</span>
                </h1>
                <LoginForm next={typeof next === "string" ? next : ""} />
            </main>
        </div>
    )
}
