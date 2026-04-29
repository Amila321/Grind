import { Link } from "react-router-dom"

export function HomePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                    <span className="text-2xl font-bold text-primary-foreground">A</span>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Welcome
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Get started by logging in or creating an account
                </p>
            </div>
            <div className="flex gap-4">
                <Link
                    to="/login"
                    className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                    Log in
                </Link>
                <Link
                    to="/signup"
                    className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
                >
                    Sign up
                </Link>
            </div>
        </div>
    )
}
