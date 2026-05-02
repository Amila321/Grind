import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHabits, type DashboardResponse, type DashboardHabitResponse } from "../hooks/useHabits";
import { useDashboardRealtime, type HabitRealtimeEvent } from "../hooks/useDashboardRealtime";
import { useDebouncedCallback } from "../hooks/useDebounce";
import { Loader2, Check, Plus, Wifi, WifiOff, AlertCircle } from "lucide-react";

type StoredUser = {
    id: number;
    username: string;
};

function getHabitEventLabel(type: HabitRealtimeEvent["type"]) {
    switch (type) {
        case "HABIT_CREATED":
            return "created";
        case "HABIT_UPDATED":
            return "updated";
        case "HABIT_DELETED":
            return "deleted";
        case "HABIT_COMPLETED":
            return "completed";
        case "HABIT_UNCOMPLETED":
            return "uncompleted";
        default:
            return "changed";
    }
}

function HabitItem({
    habit,
    isOwn,
    onToggle,
    isToggling,
    isOptimistic,
}: {
    habit: DashboardHabitResponse;
    isOwn: boolean;
    onToggle?: () => void;
    isToggling?: boolean;
    isOptimistic?: boolean;
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
                    } ${isToggling ? "opacity-50" : ""} ${isOptimistic ? "opacity-70" : ""}`}
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
    userId,
    onToggleHabit,
    togglingHabitId,
    optimisticHabitIds,
    onUserClick,
}: {
    username: string;
    habits: DashboardHabitResponse[];
    completedCount: number;
    totalCount: number;
    isOwn: boolean;
    userId?: number;
    onToggleHabit?: (habitId: number, completedToday: boolean) => void;
    togglingHabitId?: number | null;
    optimisticHabitIds?: Set<number>;
    onUserClick?: (userId: number) => void;
}) {
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => onUserClick?.(userId!)}
                    disabled={isOwn || !userId}
                    className={`flex items-center gap-3 ${!isOwn && userId ? "cursor-pointer hover:opacity-80" : ""}`}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-foreground">
                            {isOwn ? "You" : username}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {completedCount} / {totalCount} completed
                        </p>
                    </div>
                </button>
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
                            isOptimistic={optimisticHabitIds?.has(habit.id)}
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
    const statusConfig: Record<string, { icon: typeof Wifi; color: string; label: string; animate?: boolean }> = {
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
    const [optimisticHabitIds, setOptimisticHabitIds] = useState<Set<number>>(new Set());
    const [lastEvent, setLastEvent] = useState<HabitRealtimeEvent | null>(null);
    
    // Prevent concurrent toggle operations on the same habit
    const pendingTogglesRef = useRef<Set<number>>(new Set());
    // Track if a dashboard fetch is in progress
    const isFetchingRef = useRef(false);

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const user: StoredUser | null = useMemo(() => {
        return storedUser ? JSON.parse(storedUser) : null;
    }, [storedUser]);

    const loadDashboard = useCallback(async () => {
        // Prevent concurrent fetches
        if (isFetchingRef.current) {
            return;
        }
        
        isFetchingRef.current = true;
        try {
            setError(null);
            const data = await getDashboard();
            setDashboard(data);
            // Clear optimistic state after successful fetch
            setOptimisticHabitIds(new Set());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        } finally {
            isFetchingRef.current = false;
        }
    }, [getDashboard]);

    // Debounce dashboard reload on WebSocket events (300ms)
    const debouncedLoadDashboard = useDebouncedCallback(loadDashboard, 300);

    const handleHabitEvent = useCallback((event: HabitRealtimeEvent) => {
        setLastEvent(event);
        // Use debounced reload to batch rapid WebSocket events
        debouncedLoadDashboard();
    }, [debouncedLoadDashboard]);

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
        // Prevent duplicate toggles for the same habit
        if (pendingTogglesRef.current.has(habitId)) {
            return;
        }
        
        pendingTogglesRef.current.add(habitId);
        setTogglingHabitId(habitId);
        setError(null);

        // Optimistic UI update
        setDashboard((prev) => {
            if (!prev) return prev;
            
            const newCompletedToday = !completedToday;
            const updatedHabits = prev.currentUser.habits.map((h) =>
                h.id === habitId ? { ...h, completedToday: newCompletedToday } : h
            );
            const newCompletedCount = updatedHabits.filter((h) => h.completedToday).length;
            
            return {
                ...prev,
                currentUser: {
                    ...prev.currentUser,
                    habits: updatedHabits,
                    completedCount: newCompletedCount,
                },
            };
        });
        
        setOptimisticHabitIds((prev) => new Set(prev).add(habitId));

        try {
            if (completedToday) {
                await uncompleteHabitToday(habitId);
            } else {
                await completeHabitToday(habitId);
            }
            // Reload to get server state (removes optimistic flag)
            await loadDashboard();
        } catch (err) {
            // Revert optimistic update on error
            setDashboard((prev) => {
                if (!prev) return prev;
                
                const revertedHabits = prev.currentUser.habits.map((h) =>
                    h.id === habitId ? { ...h, completedToday: completedToday } : h
                );
                const revertedCompletedCount = revertedHabits.filter((h) => h.completedToday).length;
                
                return {
                    ...prev,
                    currentUser: {
                        ...prev.currentUser,
                        habits: revertedHabits,
                        completedCount: revertedCompletedCount,
                    },
                };
            });
            setError(err instanceof Error ? err.message : "Failed to update habit");
        } finally {
            pendingTogglesRef.current.delete(habitId);
            setTogglingHabitId(null);
            setOptimisticHabitIds((prev) => {
                const next = new Set(prev);
                next.delete(habitId);
                return next;
            });
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </main>
        );
    }

    const hasActiveHabits = dashboard?.currentUser?.habits && dashboard.currentUser.habits.length > 0;

    return (
        <main className="min-h-screen p-8 bg-background">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header with user info and connection status */}
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
                                    Dashboard
                                </p>
                            </div>
                        </div>
                        <div>
                            <ConnectionStatus status={wsStatus} />
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
                        {getHabitEventLabel(lastEvent.type)}
                        {" "}
                        <span className="font-medium">{lastEvent.habitTitle}</span>
                    </div>
                )}

                {/* No habits - prompt to set up */}
                {!hasActiveHabits && (
                    <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="h-12 w-12 rounded-full border-2 border-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-foreground">No Habits Yet</h2>
                            <p className="text-muted-foreground">
                                You haven&apos;t set up any habits yet. Add your first habits to start tracking!
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
                            optimisticHabitIds={optimisticHabitIds}
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
                                    userId={friend.user.id}
                                    habits={friend.habits}
                                    completedCount={friend.completedCount}
                                    totalCount={friend.totalCount}
                                    isOwn={false}
                                    onUserClick={(userId) => navigate(`/profile/${userId}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
