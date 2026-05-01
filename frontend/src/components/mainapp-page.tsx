import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FriendshipDashboard } from "./friendship/FriendshipDashboard";
import { useHabits, type DashboardResponse, type DashboardHabitResponse } from "../hooks/useHabits";
import { useDashboardRealtime, type HabitRealtimeEvent } from "../hooks/useDashboardRealtime";
import { Loader2, Check, Circle, Plus, Wifi, WifiOff, AlertCircle } from "lucide-react";

type StoredUser = {
    id: number;
    username: string;
};

function HabitItem({
    habit,
    isOwn,
    onToggle,
    isToggling,
}: {
    habit: DashboardHabitResponse;
    isOwn: boolean;
    onToggle?: () => void;
    isToggling?: boolean;
}) {
    return (
        <li className="flex items-center gap-3 py-2">
            {isOwn ? (
                <button
                    type="button"
                    onClick={onToggle}
                    disabled={isToggling}
                    className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-colors ${
                        habit.completedToday
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-muted-foreground hover:border-primary"
                    } ${isToggling ? "opacity-50" : ""}`}
                    aria-label={habit.completedToday ? `Mark ${habit.title} as incomplete` : `Mark ${habit.title} as complete`}
                >
                    {isToggling ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : habit.completedToday ? (
                        <Check className="h-3 w-3" />
                    ) : null}
                </button>
            ) : (
                <span
                    className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 ${
                        habit.completedToday
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-muted-foreground"
                    }`}
                >
                    {habit.completedToday ? <Check className="h-3 w-3" /> : null}
                </span>
            )}
            <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${habit.completedToday ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {habit.title}
                </p>
                {habit.description && (
                    <p className="text-xs text-muted-foreground truncate">{habit.description}</p>
                )}
            </div>
        </li>
    );
}

function UserHabitCard({
    username,
    habits,
    completedCount,
    totalCount,
    isOwn,
    onToggleHabit,
    togglingHabitId,
}: {
    username: string;
    habits: DashboardHabitResponse[];
    completedCount: number;
    totalCount: number;
    isOwn: boolean;
    onToggleHabit?: (habitId: number, completedToday: boolean) => void;
    togglingHabitId?: number | null;
}) {
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">
                            {isOwn ? "You" : username}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {completedCount} / {totalCount} completed
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-lg font-bold text-foreground">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Habits list */}
            {habits.length > 0 ? (
                <ul className="divide-y divide-border">
                    {habits.map((habit) => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            isOwn={isOwn}
                            onToggle={isOwn && onToggleHabit ? () => onToggleHabit(habit.id, habit.completedToday) : undefined}
                            isToggling={togglingHabitId === habit.id}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-2">No habits</p>
            )}
        </div>
    );
}

function ConnectionStatus({ status }: { status: string }) {
    const statusConfig = {
        CONNECTED: { icon: Wifi, color: "text-green-500", label: "Live" },
        CONNECTING: { icon: Loader2, color: "text-yellow-500", label: "Connecting", animate: true },
        DISCONNECTED: { icon: WifiOff, color: "text-muted-foreground", label: "Offline" },
        ERROR: { icon: AlertCircle, color: "text-red-500", label: "Error" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.DISCONNECTED;
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 text-xs ${config.color}`}>
            <Icon className={`h-3 w-3 ${config.animate ? "animate-spin" : ""}`} />
            <span>{config.label}</span>
        </div>
    );
}

export function MainAppPage() {
    const navigate = useNavigate();
    const { getDashboard, completeHabitToday, uncompleteHabitToday } = useHabits();

    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingHabitId, setTogglingHabitId] = useState<number | null>(null);
    const [lastEvent, setLastEvent] = useState<HabitRealtimeEvent | null>(null);

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const user: StoredUser | null = storedUser ? JSON.parse(storedUser) : null;

    const loadDashboard = useCallback(async () => {
        try {
            setError(null);
            const data = await getDashboard();
            setDashboard(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
    }, [getDashboard]);

    const handleHabitEvent = useCallback((event: HabitRealtimeEvent) => {
        setLastEvent(event);
        loadDashboard();
    }, [loadDashboard]);

    const { status: wsStatus } = useDashboardRealtime({
        userId: user?.id ?? null,
        enabled: !!token && !!user,
        onHabitEvent: handleHabitEvent,
    });

    useEffect(() => {
        if (!token || !user) {
            navigate("/login");
            return;
        }

        async function init() {
            setIsLoading(true);
            await loadDashboard();
            setIsLoading(false);
        }

        init();
    }, [token, user, navigate, loadDashboard]);

    async function handleToggleHabit(habitId: number, completedToday: boolean) {
        setTogglingHabitId(habitId);
        setError(null);

        try {
            if (completedToday) {
                await uncompleteHabitToday(habitId);
            } else {
                await completeHabitToday(habitId);
            }
            await loadDashboard();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update habit");
        } finally {
            setTogglingHabitId(null);
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </main>
        );
    }

    const hasActiveHabits = dashboard?.currentUser?.habits && dashboard.currentUser.habits.length > 0;

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header with user info and logout */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                                {user?.username?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-foreground">
                                    {user?.username ?? "No user"}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Welcome back
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ConnectionStatus status={wsStatus} />
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Realtime Activity Panel */}
                {lastEvent && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-700 text-sm">
                        <span className="font-medium">{lastEvent.actor.username}</span>
                        {" "}
                        {lastEvent.type === "HABIT_COMPLETED" ? "completed" : "uncompleted"}
                        {" "}
                        <span className="font-medium">{lastEvent.habitTitle}</span>
                    </div>
                )}

                {/* No habits - prompt to set up */}
                {!hasActiveHabits && (
                    <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
                        <div className="flex justify-center">
                            <Circle className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-foreground">No Active Habits</h2>
                            <p className="text-muted-foreground">
                                You haven&apos;t set up any habits yet. Create your habit list to start tracking!
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/habits/setup")}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Set Up Habits
                        </button>
                    </div>
                )}

                {/* Current User Habits */}
                {hasActiveHabits && dashboard?.currentUser && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground">Your Habits</h2>
                            <button
                                type="button"
                                onClick={() => navigate("/habits/setup")}
                                className="text-sm text-primary hover:underline"
                            >
                                Edit Habits
                            </button>
                        </div>
                        <UserHabitCard
                            username={dashboard.currentUser.user.username}
                            habits={dashboard.currentUser.habits}
                            completedCount={dashboard.currentUser.completedCount}
                            totalCount={dashboard.currentUser.totalCount}
                            isOwn={true}
                            onToggleHabit={handleToggleHabit}
                            togglingHabitId={togglingHabitId}
                        />
                    </div>
                )}

                {/* Friends Section */}
                {dashboard?.friends && dashboard.friends.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">Friends</h2>
                        <div className="space-y-4">
                            {dashboard.friends.map((friend) => (
                                <UserHabitCard
                                    key={friend.user.id}
                                    username={friend.user.username}
                                    habits={friend.habits}
                                    completedCount={friend.completedCount}
                                    totalCount={friend.totalCount}
                                    isOwn={false}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Friendship Dashboard */}
                <FriendshipDashboard />
            </div>
        </main>
    );
}
