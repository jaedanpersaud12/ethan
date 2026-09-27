/*
 * One owner, one password. The session is an expiry signed with HMAC-SHA256 —
 * no user table, nothing to leak but the cookie. Web Crypto only, so the proxy
 * and server actions verify it the same way.
 */
export const SESSION_COOKIE = "ethanol_admin"
export const SESSION_TTL = 60 * 60 * 24 * 30

const encoder = new TextEncoder()

async function key() {
    const secret = process.env.SESSION_SECRET
    if (!secret) throw new Error("SESSION_SECRET is not set")
    return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
        "sign",
        "verify",
    ])
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")

export async function signSession(now = Date.now()) {
    const exp = String(Math.floor(now / 1000) + SESSION_TTL)
    const sig = await crypto.subtle.sign("HMAC", await key(), encoder.encode(exp))
    return `${exp}.${hex(sig)}`
}

export async function verifySession(token: string | undefined) {
    if (!token) return false
    const [exp, sig] = token.split(".")
    if (!exp || !sig || !/^[0-9a-f]{64}$/.test(sig)) return false
    if (Number(exp) * 1000 < Date.now()) return false
    const bytes = new Uint8Array(sig.match(/../g)!.map((h) => parseInt(h, 16)))
    return crypto.subtle.verify("HMAC", await key(), bytes, encoder.encode(exp))
}

/** Compares through HMAC so the time taken says nothing about the password. */
export async function passwordMatches(attempt: string) {
    const expected = process.env.ADMIN_PASSWORD
    if (!expected) return false
    const k = await key()
    const [a, b] = await Promise.all([
        crypto.subtle.sign("HMAC", k, encoder.encode(attempt)),
        crypto.subtle.sign("HMAC", k, encoder.encode(expected)),
    ])
    return hex(a) === hex(b)
}
