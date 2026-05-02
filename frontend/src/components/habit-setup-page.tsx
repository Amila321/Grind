import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHabits, type HabitResponse } from "../hooks/useHabits";
import { Loader2, Plus, Trash2, Save, X, Pencil } from "lucide-react";

type StoredUser = {
    id: number;
    username: string;
};

export function HabitSetupPage() {
    const navigate = useNavigate();
    const {
        getHabits,
        addHabit,
        updateHabit,
        deleteHabit,
    } = useHabits();

    const [habits, setHabits] = useState<HabitResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const pendingDeletesRef = useRef<Set<number>>(new Set());
    const isFetchingRef = useRef(false);

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const user: StoredUser | null = useMemo(() => {
        return storedUser ? JSON.parse(storedUser) : null;
    }, [storedUser]);

    const loadHabits = useCallback(async () => {
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;

        try {
            setError(null);
            const data = await getHabits();
            setHabits(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load habits");
        } finally {
            isFetchingRef.current = false;
        }
    }, [getHabits]);

    useEffect(() => {
        if (!token || !user) {
            navigate("/login");
            return;
        }

        async function init() {
            setIsLoading(true);
            await loadHabits();
            setIsLoading(false);
        }

        init();
    }, [token, user?.id, navigate, loadHabits]);

    async function handleAddHabit(e: React.FormEvent) {
        e.preventDefault();

        if (!title.trim() || isAdding) {
            return;
        }

        setIsAdding(true);
        setError(null);

        try {
            const newHabit = await addHabit({
                title: title.trim(),
                description: description.trim() || undefined,
            });

            setHabits((prev) => [...prev, newHabit]);
            setTitle("");
            setDescription("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add habit");
            await loadHabits();
        } finally {
            setIsAdding(false);
        }
    }

    function startEditing(habit: HabitResponse) {
        setEditingId(habit.id);
        setEditTitle(habit.title);
        setEditDescription(habit.description ?? "");
        setError(null);
    }

    function cancelEditing() {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
    }

    async function handleUpdateHabit(habit: HabitResponse) {
        if (!editTitle.trim() || savingId !== null) {
            return;
        }

        setSavingId(habit.id);
        setError(null);

        try {
            const updatedHabit = await updateHabit(habit.id, {
                title: editTitle.trim(),
                description: editDescription.trim() || null,
                position: habit.position,
            });

            setHabits((prev) =>
                prev.map((item) => item.id === habit.id ? updatedHabit : item)
            );

            cancelEditing();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update habit");
            await loadHabits();
        } finally {
            setSavingId(null);
        }
    }

    async function handleDeleteHabit(habitId: number) {
        if (pendingDeletesRef.current.has(habitId)) {
            return;
        }

        pendingDeletesRef.current.add(habitId);
        setDeletingId(habitId);
        setError(null);

        const previousHabits = habits;
        setHabits((prev) => prev.filter((habit) => habit.id !== habitId));

        try {
            await deleteHabit(habitId);
        } catch (err) {
            setHabits(previousHabits);
            setError(err instanceof Error ? err.message : "Failed to delete habit");
        } finally {
            pendingDeletesRef.current.delete(habitId);
            setDeletingId(null);
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading habits...</span>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-8 bg-background">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Manage Your Habits
                    </h1>
                    <p className="text-muted-foreground">
                        Add, edit and delete your daily habits. Changes are visible on your dashboard immediately.
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

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
                                Description optional
                            </label>
                            <input
                                id="description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., 30 minutes of cardio"
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

                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-foreground">
                            Your Habits ({habits.length})
                        </h2>
                    </div>

                    {habits.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4 text-center">
                            No habits yet. Add your first habit above.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {habits.map((habit) => {
                                const isEditing = editingId === habit.id;

                                return (
                                    <li
                                        key={habit.id}
                                        className={`rounded-lg border border-border bg-background p-4 transition-opacity ${
                                            deletingId === habit.id ? "opacity-50" : ""
                                        }`}
                                    >
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Habit title"
                                                />

                                                <input
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Habit description"
                                                />

                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateHabit(habit)}
                                                        disabled={savingId === habit.id || !editTitle.trim()}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                                    >
                                                        {savingId === habit.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Save className="h-4 w-4" />
                                                        )}
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={cancelEditing}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <p className="font-medium text-foreground">{habit.title}</p>
                                                    {habit.description && (
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {habit.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(habit)}
                                                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                                        aria-label={`Edit ${habit.title}`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

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
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

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