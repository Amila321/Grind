import { Link } from "react-router-dom"
import { CheckCircle2, Users, Zap, Flame, ArrowRight } from "lucide-react"

const features = [
    {
        icon: CheckCircle2,
        title: "Daily Habits",
        description: "Track the small actions that compound into better wellbeing.",
        color: "bg-emerald-100 text-emerald-600",
    },
    {
        icon: Users,
        title: "Friends & Accountability",
        description: "Stay motivated by seeing friends' progress in realtime.",
        color: "bg-blue-100 text-blue-600",
    },
    {
        icon: Zap,
        title: "Realtime Progress",
        description: "Watch habit completions update live as you and friends check in.",
        color: "bg-amber-100 text-amber-600",
    },
    {
        icon: Flame,
        title: "Streaks & Completed Days",
        description: "Build consistency and visualize your progress over time.",
        color: "bg-orange-100 text-orange-600",
    },
]

export function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <div className="mx-auto max-w-5xl flex items-center justify-between px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">G</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">Grind</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/signup"
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                        <span className="text-3xl font-bold text-primary-foreground">G</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
                        Build better habits{" "}
                        <span className="text-primary">together</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground text-pretty leading-relaxed">
                        Grind is a social habit tracker where you complete daily habits, follow friends&apos; progress in realtime, and build streaks through consistency.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                        >
                            Get started free
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
                        >
                            I already have an account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 bg-muted/30">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Everything you need to stay consistent
                        </h2>
                        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                            Simple tools that help you build lasting habits with the support of friends.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Ready to start your journey?
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Join thousands building better habits with friends. It&apos;s free to get started.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
                        >
                            Create free account
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border px-4 sm:px-6 py-8">
                <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                            <span className="text-sm font-bold text-primary-foreground">G</span>
                        </div>
                        <span className="font-semibold text-foreground">Grind</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Build better habits, one day at a time.
                    </p>
                </div>
            </footer>
        </div>
    )
}
