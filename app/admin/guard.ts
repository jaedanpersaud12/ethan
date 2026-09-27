import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, verifySession } from "@/lib/session"

export async function isAdmin() {
    return verifySession((await cookies()).get(SESSION_COOKIE)?.value)
}

/** For pages: bounce to the login screen. */
export async function requireAdmin() {
    if (!(await isAdmin())) redirect("/admin/login")
}
