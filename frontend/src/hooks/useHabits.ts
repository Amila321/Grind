import { useCallback, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type HabitResponse = {
    id: number;
    title: string;
    description: string | null;
    position: number;
};

export type HabitCompletionResponse = {
    id: number;
    habitId: number;
    completionDate: string;
};

export type DashboardHabitResponse = {
    id: number;
    title: string;
    description: string | null;
    position: number;
    completedToday: boolean;
};

export type DashboardUserResponse = {
    user: {
        id: number;
        username: string;
    };
    habits: DashboardHabitResponse[];
    completedCount: number;
    totalCount: number;
};

export type DashboardResponse = {
    currentUser: DashboardUserResponse;
    friends: DashboardUserResponse[];
};

export type AddHabitRequest = {
    title: string;
    description?: string;
};

export type UpdateHabitRequest = {
    title: string;
    description?: string | null;
    position?: number;
};

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No auth token found");
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ?? `Request failed with status ${response.status}`
        );
    }

    return response.json();
}

async function handleEmptyResponse(response: Response): Promise<void> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ?? `Request failed with status ${response.status}`
        );
    }
}

export function useHabits() {
    const getHabits = useCallback(async (): Promise<HabitResponse[]> => {
        const response = await fetch(`${API_URL}/api/habit/habits`, {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
        });

        return handleResponse<HabitResponse[]>(response);
    }, []);

    const addHabit = useCallback(
        async (data: AddHabitRequest): Promise<HabitResponse> => {
            const response = await fetch(`${API_URL}/api/habit/habits`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            return handleResponse<HabitResponse>(response);
        },
        []
    );

    const updateHabit = useCallback(
        async (
            habitId: number,
            data: UpdateHabitRequest
        ): Promise<HabitResponse> => {
            const response = await fetch(`${API_URL}/api/habit/habits/${habitId}`, {
                method: "PUT",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            return handleResponse<HabitResponse>(response);
        },
        []
    );

    const deleteHabit = useCallback(async (habitId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/api/habit/habits/${habitId}`, {
            method: "DELETE",
            headers: {
                ...getAuthHeaders(),
            },
        });

        return handleEmptyResponse(response);
    }, []);

    const completeHabitToday = useCallback(
        async (habitId: number): Promise<HabitCompletionResponse> => {
            const response = await fetch(
                `${API_URL}/api/habit/habits/${habitId}/completions/today`,
                {
                    method: "POST",
                    headers: {
                        ...getAuthHeaders(),
                    },
                }
            );

            return handleResponse<HabitCompletionResponse>(response);
        },
        []
    );

    const uncompleteHabitToday = useCallback(async (habitId: number): Promise<void> => {
        const response = await fetch(
            `${API_URL}/api/habit/habits/${habitId}/completions/today`,
            {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        return handleEmptyResponse(response);
    }, []);

    const getDashboard = useCallback(async (): Promise<DashboardResponse> => {
        const response = await fetch(`${API_URL}/api/dashboard`, {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
        });

        return handleResponse<DashboardResponse>(response);
    }, []);

    return useMemo(
        () => ({
            getHabits,
            addHabit,
            updateHabit,
            deleteHabit,
            completeHabitToday,
            uncompleteHabitToday,
            getDashboard,
        }),
        [
            getHabits,
            addHabit,
            updateHabit,
            deleteHabit,
            completeHabitToday,
            uncompleteHabitToday,
            getDashboard,
        ]
    );
}