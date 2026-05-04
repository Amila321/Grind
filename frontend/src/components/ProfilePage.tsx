import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Trophy,
    ArrowLeft,
    Flame,
} from "lucide-react";
import { useProfile, type ProfileResponse } from "../hooks/useProfile";

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
    const { userId: userIdParam } = useParams<{ userId?: string }>();
    const { getProfileByUserId } = useProfile();

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [visibleMonth, setVisibleMonth] = useState(() => new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const currentUser: StoredUser | null = useMemo(() => {
        return storedUser ? JSON.parse(storedUser) : null;
    }, [storedUser]);

    // Determine target user ID
    const targetUserId = useMemo(() => {
        if (userIdParam) {
            const parsed = Number(userIdParam);
            return Number.isNaN(parsed) ? null : parsed;
        }
        return currentUser?.id ?? null;
    }, [userIdParam, currentUser?.id]);

    const isOwnProfile = useMemo(() => {
        return targetUserId === currentUser?.id;
    }, [targetUserId, currentUser?.id]);

    const profileTitle = useMemo(() => {
        if (isOwnProfile) return "My Profile";
        return "User Profile";
    }, [isOwnProfile]);

    const completedDaysSet = useMemo(() => {
        if (!profile) return new Set<string>();
        return new Set(profile.completedDays.map((day) => day.day));
    }, [profile]);

    const calendarDays = useMemo(() => {
        return buildCalendarDays(visibleMonth);
    }, [visibleMonth]);

    const completedDaysInVisibleMonth = useMemo(() => {
        if (!profile) return 0;
        const year = visibleMonth.getFullYear();
        const month = visibleMonth.getMonth();

        return profile.completedDays.filter((completedDay) => {
            const [completedYear, completedMonth] = completedDay.day
                .split("-")
                .map(Number);

            return completedYear === year && completedMonth === month + 1;
        }).length;
    }, [profile, visibleMonth]);

    const loadProfile = useCallback(async () => {
        if (!targetUserId) {
            setError("Unable to determine target user");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const profileData = await getProfileByUserId(targetUserId);
            setProfile(profileData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    }, [targetUserId, getProfileByUserId]);

    useEffect(() => {
        if (!token || !currentUser) {
            navigate("/login");
            return;
        }

        queueMicrotask(() => {
            loadProfile();
        });
    }, [token, currentUser, navigate, loadProfile]);

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

    function handleBackClick() {
        if (isOwnProfile) {
            navigate("/mainapp");
        } else {
            navigate(-1);
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading profile...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error || "Profile not found"}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {!isOwnProfile && (
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                )}

                <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-xl sm:text-2xl font-bold text-primary-foreground shrink-0">
                                {profile.user.username.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">{profileTitle}</p>
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                                    {profile.user.username}
                                </h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="rounded-xl border border-border bg-background p-3 sm:p-5">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-green-100 text-green-700 shrink-0">
                                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            Completed
                                        </p>
                                        <p className="text-xl sm:text-3xl font-bold text-foreground">
                                            {profile.completedDaysCount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 sm:p-5">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-orange-100 text-orange-700 shrink-0">
                                        <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            Streak
                                        </p>
                                        <p className="text-xl sm:text-3xl font-bold text-foreground">
                                            {profile.streak.currentStreak}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 sm:p-5">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 shrink-0">
                                        <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            Best
                                        </p>
                                        <p className="text-xl sm:text-3xl font-bold text-foreground">
                                            {profile.streak.bestStreak}
                                        </p>
                                    </div>
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

                <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                    <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                                    Activity Calendar
                                </h2>
                            </div>

                            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                                {completedDaysInVisibleMonth} completed days this month
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={goToPreviousMonth}
                                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <p className="min-w-28 sm:min-w-36 text-center text-xs sm:text-sm font-medium text-foreground">
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

                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {WEEK_DAYS.map((weekDay) => (
                            <div
                                key={weekDay}
                                className="pb-1 sm:pb-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground"
                            >
                                {weekDay.charAt(0)}
                                <span className="hidden sm:inline">{weekDay.slice(1)}</span>
                            </div>
                        ))}

                        {calendarDays.map((calendarDay, index) => {
                            if (!calendarDay.day || !calendarDay.dateKey) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="aspect-square rounded-lg sm:rounded-xl"
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
                                    className={`aspect-square rounded-lg sm:rounded-xl border p-1 sm:p-2 transition-colors ${
                                        isCompleted
                                            ? "border-green-500 bg-green-500 text-white shadow-sm"
                                            : "border-border bg-background text-muted-foreground"
                                    } ${isToday && !isCompleted ? "ring-2 ring-primary/40" : ""}`}
                                >
                                    <div className="flex h-full flex-col items-center justify-center gap-0.5 sm:gap-1">
                                        <span className="text-xs sm:text-sm font-semibold">
                                            {calendarDay.day}
                                        </span>

                                        {isCompleted && (
                                            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
                            <span>Completed</span>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border border-border bg-background ring-2 ring-primary/40" />
                            <span>Today</span>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
