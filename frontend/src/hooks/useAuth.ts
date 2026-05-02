import { useCallback, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type UserDto = {
    id: number;
    username: string;
};

export type LoginResponse = {
    token: string;
    user: UserDto;
};

export type RegisterRequest = {
    username: string;
    password: string;
};

export type LoginRequest = {
    username: string;
    password: string;
};

async function handleResponse<T>(
    response: Response,
    fallbackMessage: string
): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.message ?? fallbackMessage);
    }

    return response.json();
}

export function useAuth() {
    const register = useCallback(async (data: RegisterRequest): Promise<UserDto> => {
        const response = await fetch(`${API_URL}/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return handleResponse<UserDto>(response, "Registration failed");
    }, []);

    const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const loginResponse = await handleResponse<LoginResponse>(
            response,
            "Login failed"
        );

        localStorage.setItem("token", loginResponse.token);
        localStorage.setItem("user", JSON.stringify(loginResponse.user));

        return loginResponse;
    }, []);


    return useMemo(
        () => ({
            register,
            login,
        }),
        [register, login]
    );
}