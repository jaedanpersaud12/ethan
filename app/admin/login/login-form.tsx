"use client"

import { useActionState } from "react"
import { signIn } from "@/app/admin/actions"

export function LoginForm({ next }: { next: string }) {
    const [state, action, pending] = useActionState(signIn, { error: null })
    return (
        <form action={action} className="mt-10 max-w-2xl">
            <input type="hidden" name="next" value={next} />
            <label htmlFor="password" className="label opacity-70">
                Password
            </label>
            <div className="mt-2 flex items-center gap-3 border-b border-paper/30 pb-2 focus-within:border-lime">
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    aria-invalid={state.error ? true : undefined}
                    aria-describedby="password-error"
                    className="min-w-0 flex-1 bg-transparent text-[28px] tracking-[0.2em] text-paper md:text-[36px]"
                />
                <button
                    type="submit"
                    disabled={pending}
                    className="label grid min-h-11 shrink-0 items-center rounded-full bg-lime px-5 text-ink transition-[background-color,scale] duration-150 hover:bg-paper active:scale-[0.96] disabled:opacity-60"
                >
                    <span className="col-start-1 row-start-1" style={{ opacity: pending ? 0 : 1 }}>
                        Sign in →
                    </span>
                    <span className="col-start-1 row-start-1" style={{ opacity: pending ? 1 : 0 }}>
                        Checking<span className="blink">_</span>
                    </span>
                </button>
            </div>
            <p id="password-error" className="label mt-3 min-h-4 text-pink" aria-live="polite">
                {state.error}
            </p>
        </form>
    )
}
