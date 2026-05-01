import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHabits, type HabitResponse } from "../hooks/useHabits";
import { Loader2, Plus, Trash2, Send } from "lucide-react";

type StoredUser = {
    id: number;
    username: string;
};

export function HabitSetupPage() {
    const navigate = useNavigate();
    const {
        getOrCreateDraftList,
        getDraftHabits,
        addHabitToDraft,
        deleteHabitFromDraft,
        publishDraftList,
    } = useHabits();

    const [habits, setHabits] = useState<HabitResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Prevent concurrent operations
    const pendingDeletesRef = useRef<Set<number>>(new Set());
    const isInitializedRef = useRef(false);
    const isFetchingRef = useRef(false);

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const user: StoredUser | null = storedUser ? JSON.parse(storedUser) : null;

    const loadDraftHabits = useCallback(async () => {
        // Prevent concurrent fetches
        if (isFetchingRef.current) {
            return;
        }
        
        isFetchingRef.current = true;
        try {
            setError(null);
            const draftHabits = await getDraftHabits();
            setHabits(draftHabits);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load habits");
        } finally {
            isFetchingRef.current = false;
        }
    }, [getDraftHabits]);

    useEffect(() => {
        if (!token || !user) {
            navigate("/login");
            return;
        }

        // Prevent double initialization
        if (isInitializedRef.current) {
            return;
        }
        isInitializedRef.current = true;

        async function initDraft() {
            setIsLoading(true);
            try {
                await getOrCreateDraftList();
                await loadDraftHabits();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to initialize draft");
            } finally {
                setIsLoading(false);
            }
        }

        initDraft();
    }, [token, user, navigate, getOrCreateDraftList, loadDraftHabits]);

    async function handleAddHabit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || isAdding) return;

        setIsAdding(true);
        setError(null);

        try {
            const newHabit = await addHabitToDraft({
                title: title.trim(),
                description: description.trim() || undefined,
            });
            // Optimistically add to list
            setHabits((prev) => [...prev, newHabit]);
            setTitle("");
            setDescription("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add habit");
            // Reload to sync state on error
            await loadDraftHabits();
        } finally {
            setIsAdding(false);
        }
    }

    async function handleDeleteHabit(habitId: number) {
        // Prevent duplicate delete requests
        if (pendingDeletesRef.current.has(habitId)) {
            return;
        }
        
        pendingDeletesRef.current.add(habitId);
        setDeletingId(habitId);
        setError(null);

        // Optimistic update - remove immediately
        const previousHabits = habits;
        setHabits((prev) => prev.filter((h) => h.id !== habitId));

        try {
            await deleteHabitFromDraft(habitId);
        } catch (err) {
            // Revert optimistic update on error
            setHabits(previousHabits);
            setError(err instanceof Error ? err.message : "Failed to delete habit");
        } finally {
            pendingDeletesRef.current.delete(habitId);
            setDeletingId(null);
        }
    }

    async function handlePublish() {
        if (habits.length === 0 || isPublishing) {
            if (habits.length === 0) {
                setError("Add at least one habit before publishing");
            }
            return;
        }

        setIsPublishing(true);
        setError(null);

        try {
            await publishDraftList();
            navigate("/mainapp");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish habits");
        } finally {
            setIsPublishing(false);
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading draft habits...</span>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-8 bg-background">
            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Set Up Your Habits</h1>
                    <p className="text-muted-foreground">
                        Add habits you want to track daily. Once you&apos;re happy with your list, publish it to start tracking.
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Add Habit Form */}
                <form onSubmit={handleAddHabit} className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Add New Habit</h2>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                                Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Morning exercise"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isAdding}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                                Description (optional)
                            </label>
                            <input
                                id="description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., 30 minutes of cardio or strength training"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isAdding}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding || !title.trim()}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        Add Habit
                    </button>
                </form>

                {/* Current Draft Habits */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-foreground">
                            Draft Habits ({habits.length})
                        </h2>
                    </div>

                    {habits.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4 text-center">
                            No habits added yet. Add your first habit above!
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {habits.map((habit) => (
                                <li
                                    key={habit.id}
                                    className={`flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4 transition-opacity ${
                                        deletingId === habit.id ? "opacity-50" : ""
                                    }`}
                                >
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="font-medium text-foreground">{habit.title}</p>
                                        {habit.description && (
                                            <p className="text-sm text-muted-foreground truncate">
                                                {habit.description}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteHabit(habit.id)}
                                        disabled={deletingId === habit.id}
                                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Delete ${habit.title}`}
                                    >
                                        {deletingId === habit.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Publish Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={isPublishing || habits.length === 0}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPublishing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Publish Habits
                    </button>
                </div>

                {/* Back Link */}
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => navigate("/mainapp")}
                        className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </main>
    );
}
