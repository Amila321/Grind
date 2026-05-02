import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react";
import {
    useCompletedDay,
    type CompletedDaysResponse,
} from "../hooks/useCompletedDay";

type StoredUser = {
    id: number;
    username: string;
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function createDateKey(year: number, month: number, day: number) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getMonthName(date: Date) {
    return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function buildCalendarDays(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();

    // JS: Sunday = 0, Monday = 1.
    // We want Monday-first calendar, so transform:
    const emptySlotsBeforeFirstDay = (firstDayOfMonth.getDay() + 6) % 7;

    const calendarDays: Array<{
        day: number | null;
        dateKey: string | null;
    }> = [];

    for (let i = 0; i < emptySlotsBeforeFirstDay; i++) {
        calendarDays.push({
            day: null,
            dateKey: null,
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
            day,
            dateKey: createDateKey(year, month, day),
        });
    }

    return calendarDays;
}

export function ProfilePage() {
    const navigate = useNavigate();
    const {
        getCompletedDaysCountByUserId,
        getCompletedDaysByUserId,
    } = useCompletedDay();

    const [completedDaysCount, setCompletedDaysCount] = useState(0);
    const [completedDays, setCompletedDays] = useState<CompletedDaysResponse[]>([]);
    const [visibleMonth, setVisibleMonth] = useState(() => new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const user: StoredUser | null = useMemo(() => {
        return storedUser ? JSON.parse(storedUser) : null;
    }, [storedUser]);

    const completedDaysSet = useMemo(() => {
        return new Set(completedDays.map((completedDay) => completedDay.day));
    }, [completedDays]);

    const calendarDays = useMemo(() => {
        return buildCalendarDays(visibleMonth);
    }, [visibleMonth]);

    const completedDaysInVisibleMonth = useMemo(() => {
        const year = visibleMonth.getFullYear();
        const month = visibleMonth.getMonth();

        return completedDays.filter((completedDay) => {
            const [completedYear, completedMonth] = completedDay.day
                .split("-")
                .map(Number);

            return completedYear === year && completedMonth === month + 1;
        }).length;
    }, [completedDays, visibleMonth]);

    const loadProfileStats = useCallback(async () => {
        if (!user) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [countResponse, completedDaysResponse] = await Promise.all([
                getCompletedDaysCountByUserId(user.id),
                getCompletedDaysByUserId(user.id),
            ]);

            setCompletedDaysCount(countResponse.count);
            setCompletedDays(completedDaysResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    }, [
        user,
        getCompletedDaysCountByUserId,
        getCompletedDaysByUserId,
    ]);

    useEffect(() => {
        if (!token || !user) {
            navigate("/login");
            return;
        }

        loadProfileStats();
    }, [token, user, navigate, loadProfileStats]);

    function goToPreviousMonth() {
        setVisibleMonth((current) => {
            return new Date(current.getFullYear(), current.getMonth() - 1, 1);
        });
    }

    function goToNextMonth() {
        setVisibleMonth((current) => {
            return new Date(current.getFullYear(), current.getMonth() + 1, 1);
        });
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background p-8">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading profile...</span>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                                {user?.username.charAt(0).toUpperCase() ?? "?"}
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">My Profile</p>
                                <h1 className="text-2xl font-bold text-foreground">
                                    {user?.username}
                                </h1>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-background p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                                    <Trophy className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total completed days
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {completedDaysCount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                <h2 className="text-lg font-semibold text-foreground">
                                    Completed Days Calendar
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {completedDaysInVisibleMonth} completed days in this month
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={goToPreviousMonth}
                                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <p className="min-w-36 text-center text-sm font-medium text-foreground">
                                {getMonthName(visibleMonth)}
                            </p>

                            <button
                                type="button"
                                onClick={goToNextMonth}
                                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                aria-label="Next month"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {WEEK_DAYS.map((weekDay) => (
                            <div
                                key={weekDay}
                                className="pb-2 text-center text-xs font-medium text-muted-foreground"
                            >
                                {weekDay}
                            </div>
                        ))}

                        {calendarDays.map((calendarDay, index) => {
                            if (!calendarDay.day || !calendarDay.dateKey) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="aspect-square rounded-xl"
                                    />
                                );
                            }

                            const isCompleted = completedDaysSet.has(calendarDay.dateKey);
                            const isToday =
                                calendarDay.dateKey ===
                                createDateKey(
                                    new Date().getFullYear(),
                                    new Date().getMonth(),
                                    new Date().getDate()
                                );

                            return (
                                <div
                                    key={calendarDay.dateKey}
                                    className={`aspect-square rounded-xl border p-2 transition-colors ${
                                        isCompleted
                                            ? "border-green-500 bg-green-500 text-white shadow-sm"
                                            : "border-border bg-background text-muted-foreground"
                                    } ${isToday && !isCompleted ? "ring-2 ring-primary/40" : ""}`}
                                >
                                    <div className="flex h-full flex-col items-center justify-center gap-1">
                                        <span className="text-sm font-semibold">
                                            {calendarDay.day}
                                        </span>

                                        {isCompleted && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-green-500" />
                            <span>Fully completed day</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full border border-border bg-background ring-2 ring-primary/40" />
                            <span>Today</span>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}