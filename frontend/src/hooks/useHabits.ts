const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type HabitListStatus = "DRAFT" | "ACTIVE";

export type HabitListResponse = {
    id: number;
    status: HabitListStatus;
};

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
    async function getOrCreateDraftList(): Promise<HabitListResponse> {
        const response = await fetch(`${API_URL}/api/habit/habit-lists/draft`, {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
            },
        });

        return handleResponse<HabitListResponse>(response);
    }

    async function getDraftHabits(): Promise<HabitResponse[]> {
        const response = await fetch(
            `${API_URL}/api/habit/habit-lists/draft/habits`,
            {
                method: "GET",
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        return handleResponse<HabitResponse[]>(response);
    }

    async function addHabitToDraft(
        data: AddHabitRequest
    ): Promise<HabitResponse> {
        const response = await fetch(
            `${API_URL}/api/habit/habit-lists/draft/habits`,
            {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        return handleResponse<HabitResponse>(response);
    }

    async function deleteHabitFromDraft(habitId: number): Promise<void> {
        const response = await fetch(
            `${API_URL}/api/habit/habit-lists/draft/habits/${habitId}`,
            {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        return handleEmptyResponse(response);
    }

    async function publishDraftList(): Promise<HabitListResponse> {
        const response = await fetch(
            `${API_URL}/api/habit/habit-lists/draft/publish`,
            {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        return handleResponse<HabitListResponse>(response);
    }

    async function getActiveHabits(): Promise<HabitResponse[]> {
        const response = await fetch(`${API_URL}/api/habit/habits/active`, {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
        });

        return handleResponse<HabitResponse[]>(response);
    }

    async function completeHabitToday(
        habitId: number
    ): Promise<HabitCompletionResponse> {
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
    }

    async function uncompleteHabitToday(habitId: number): Promise<void> {
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
    }

    async function getDashboard(): Promise<DashboardResponse> {
        const response = await fetch(`${API_URL}/api/dashboard`, {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
        });

        return handleResponse<DashboardResponse>(response);
    }

    return {
        getOrCreateDraftList,
        getDraftHabits,
        addHabitToDraft,
        deleteHabitFromDraft,
        publishDraftList,
        getActiveHabits,
        completeHabitToday,
        uncompleteHabitToday,
        getDashboard,
    };
}