import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHabits, type DashboardResponse, type DashboardHabitResponse } from "../hooks/useHabits";
import { useDashboardRealtime, type HabitRealtimeEvent } from "../hooks/useDashboardRealtime";
import { useDebouncedCallback } from "../hooks/useDebounce";
import { Loader2, Check, Plus, Wifi, WifiOff, AlertCircle, Settings2, Users, CheckCircle2, Circle, ChevronRight, Activity } from "lucide-react";

type StoredUser = {
    id: number;
    username: string;
};

function getHabitEventLabel(type: HabitRealtimeEvent["type"]) {
    switch (type) {
        case "HABIT_CREATED":
            return "created a new habit";
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
    const isCompleted = habit.completedToday;
    
    return (
        <li className={`flex items-center gap-3 py-3 px-3 -mx-3 rounded-lg transition-colors ${
            isOwn ? "hover:bg-muted/50" : ""
        } ${isOptimistic ? "opacity-70" : ""}`}>
            {isOwn ? (
                <button
                    type="button"
                    onClick={onToggle}
                    disabled={isToggling}
                    className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-md border-2 transition-all ${
                        isCompleted
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground/40 hover:border-emerald-500 hover:bg-emerald-50"
                    } ${isToggling ? "opacity-50 scale-95" : ""}`}
                    aria-label={isCompleted ? `Mark ${habit.title} as incomplete` : `Mark ${habit.title} as complete`}
                >
                    {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : null}
                </button>
            ) : (
                <span
                    className={`shrink-0 flex items-center justify-center h-5 w-5 rounded-full ${
                        isCompleted
                            ? "text-emerald-500"
                            : "text-muted-foreground/40"
                    }`}
                >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </span>
            )}
            <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium transition-colors ${
                    isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                }`}>
                    {habit.title}
                </p>
                {habit.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{habit.description}</p>
                )}
            </div>
            {isCompleted && (
                <span className="shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Done
                </span>
            )}
        </li>
    );
}

function MyHabitsCard({
    username,
    habits,
    completedCount,
    totalCount,
    onToggleHabit,
    togglingHabitId,
    optimisticHabitIds,
    onManageHabits,
}: {
    username: string;
    habits: DashboardHabitResponse[];
    completedCount: number;
    totalCount: number;
    onToggleHabit: (habitId: number, completedToday: boolean) => void;
    togglingHabitId: number | null;
    optimisticHabitIds: Set<number>;
    onManageHabits: () => void;
}) {
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const allComplete = completedCount === totalCount && totalCount > 0;

    return (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Today&apos;s Progress</h3>
                            <p className="text-xs text-muted-foreground">
                                {completedCount} of {totalCount} habits completed
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onManageHabits}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                        <Settings2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Manage</span>
                    </button>
                </div>
            </div>

            {/* Progress Section */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Daily progress</span>
                    <span className={`text-lg font-bold ${allComplete ? "text-emerald-600" : "text-foreground"}`}>
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${
                            allComplete ? "bg-emerald-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {allComplete && (
                    <p className="text-sm text-emerald-600 font-medium mt-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        All habits completed! Great job!
                    </p>
                )}
            </div>

            {/* Habits List */}
            <div className="px-5 pb-5">
                <ul className="space-y-1">
                    {habits.map((habit) => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            isOwn={true}
                            onToggle={() => onToggleHabit(habit.id, habit.completedToday)}
                            isToggling={togglingHabitId === habit.id}
                            isOptimistic={optimisticHabitIds.has(habit.id)}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
}

function FriendCard({
    username,
    userId,
    habits,
    completedCount,
    totalCount,
    onUserClick,
}: {
    username: string;
    userId: number;
    habits: DashboardHabitResponse[];
    completedCount: number;
    totalCount: number;
    onUserClick: (userId: number) => void;
}) {
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const allComplete = completedCount === totalCount && totalCount > 0;

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Clickable Header */}
            <button
                type="button"
                onClick={() => onUserClick(userId)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {username}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            {completedCount}/{totalCount} today
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${allComplete ? "text-emerald-600" : "text-foreground"}`}>
                        {Math.round(progress)}%
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
            </button>

            {/* Progress Bar */}
            <div className="px-4 pb-3">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${
                            allComplete ? "bg-emerald-500" : "bg-emerald-500/70"
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Compact Habits List */}
            {habits.length > 0 && (
                <div className="px-4 pb-3">
                    <ul className="space-y-1">
                        {habits.slice(0, 4).map((habit) => (
                            <HabitItem
                                key={habit.id}
                                habit={habit}
                                isOwn={false}
                            />
                        ))}
                        {habits.length > 4 && (
                            <li className="text-xs text-muted-foreground py-1 pl-8">
                                +{habits.length - 4} more habits
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ConnectionStatus({ status }: { status: string }) {
    const statusConfig: Record<string, { icon: typeof Wifi; color: string; bgColor: string; label: string; animate?: boolean }> = {
        CONNECTED: { icon: Wifi, color: "text-emerald-600", bgColor: "bg-emerald-50", label: "Live" },
        CONNECTING: { icon: Loader2, color: "text-amber-600", bgColor: "bg-amber-50", label: "Connecting", animate: true },
        DISCONNECTED: { icon: WifiOff, color: "text-muted-foreground", bgColor: "bg-muted", label: "Offline" },
        ERROR: { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-50", label: "Error" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.DISCONNECTED;
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
            <Icon className={`h-3 w-3 ${config.animate ? "animate-spin" : ""}`} />
            <span>{config.label}</span>
        </div>
    );
}

function RealtimeActivityBanner({ event }: { event: HabitRealtimeEvent }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
            <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm">
                <span className="font-medium">{event.actor.username}</span>
                {" "}
                {getHabitEventLabel(event.type)}
                {" "}
                <span className="font-medium">{event.habitTitle}</span>
            </p>
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
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium">Loading your dashboard...</span>
                </div>
            </main>
        );
    }

    const hasActiveHabits = dashboard?.currentUser?.habits && dashboard.currentUser.habits.length > 0;

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Hey, {user?.username ?? "there"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </p>
                    </div>
                    <ConnectionStatus status={wsStatus} />
                </header>

                {/* Realtime Activity */}
                {lastEvent && (
                    <RealtimeActivityBanner event={lastEvent} />
                )}

                {/* Error Display */}
                {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Empty State - No habits */}
                {!hasActiveHabits && (
                    <section className="rounded-2xl border-2 border-dashed border-border bg-card p-8 sm:p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">Start Your Journey</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                            You haven&apos;t set up any habits yet. Create your first habits and start building better routines!
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/habits/setup")}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4" />
                            Create Your First Habit
                        </button>
                    </section>
                )}

                {/* My Habits Section */}
                {hasActiveHabits && dashboard?.currentUser && (
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">My Habits</h2>
                        </div>
                        <MyHabitsCard
                            username={dashboard.currentUser.user.username}
                            habits={dashboard.currentUser.habits}
                            completedCount={dashboard.currentUser.completedCount}
                            totalCount={dashboard.currentUser.totalCount}
                            onToggleHabit={handleToggleHabit}
                            togglingHabitId={togglingHabitId}
                            optimisticHabitIds={optimisticHabitIds}
                            onManageHabits={() => navigate("/habits/setup")}
                        />
                    </section>
                )}

                {/* Friends Section */}
                {dashboard?.friends && dashboard.friends.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold text-foreground">Friends&apos; Progress</h2>
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {dashboard.friends.length}
                            </span>
                        </div>
                        <div className="grid gap-3">
                            {dashboard.friends.map((friend) => (
                                <FriendCard
                                    key={friend.user.id}
                                    username={friend.user.username}
                                    userId={friend.user.id}
                                    habits={friend.habits}
                                    completedCount={friend.completedCount}
                                    totalCount={friend.totalCount}
                                    onUserClick={(userId) => navigate(`/profile/${userId}`)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty Friends State */}
                {dashboard?.friends && dashboard.friends.length === 0 && hasActiveHabits && (
                    <section className="rounded-xl border border-border bg-card p-6 text-center">
                        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium text-foreground mb-1">No friends yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Add friends to see their progress and stay motivated together.
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}
