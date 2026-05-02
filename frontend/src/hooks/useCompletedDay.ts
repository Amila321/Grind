import { useCallback, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type CompletedDaysCountResponse = {
    count: number;
};

export type CompletedDaysResponse = {
    id: number;
    day: string;
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

export function useCompletedDay() {
    const getCompletedDaysCountByUserId = useCallback(
        async (userId: number): Promise<CompletedDaysCountResponse> => {
            const response = await fetch(
                `${API_URL}/api/completed-days/users/${userId}/count`,
                {
                    method: "GET",
                }
            );

            return handleResponse<CompletedDaysCountResponse>(response);
        },
        []
    );

    const getCompletedDaysByUserId = useCallback(
        async (userId: number): Promise<CompletedDaysResponse[]> => {
            const response = await fetch(
                `${API_URL}/api/completed-days/users/${userId}`,
                {
                    method: "GET",
                }
            );

            return handleResponse<CompletedDaysResponse[]>(response);
        },
        []
    );

    return useMemo(
        () => ({
            getCompletedDaysCountByUserId,
            getCompletedDaysByUserId,
        }),
        [
            getCompletedDaysCountByUserId,
            getCompletedDaysByUserId,
        ]
    );
}