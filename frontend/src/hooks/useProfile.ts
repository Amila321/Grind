import { useCallback, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type ProfileUserResponse = {
    id: number;
    username: string;
};

export type ProfileCompletedDayResponse = {
    id: number;
    day: string;
};

export type ProfileStreakResponse = {
    currentStreak: number;
    bestStreak: number;
};

export type ProfileResponse = {
    user: ProfileUserResponse;
    completedDaysCount: number;
    completedDays: ProfileCompletedDayResponse[];
    streak: ProfileStreakResponse;
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ?? `Request failed with status ${response.status}`
        );
    }

    return response.json();
}

export function useProfile() {
    const getProfileByUserId = useCallback(
        async (userId: number): Promise<ProfileResponse> => {
            const response = await fetch(
                `${API_URL}/api/profiles/users/${userId}`,
                {
                    method: "GET",
                }
            );

            return handleResponse<ProfileResponse>(response);
        },
        []
    );

    return useMemo(
        () => ({
            getProfileByUserId,
        }),
        [getProfileByUserId]
    );
}