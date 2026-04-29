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

export function useAuth() {
    async function register(data: RegisterRequest): Promise<UserDto> {
        const response = await fetch(`${API_URL}/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            throw new Error(
                errorData?.message ?? "Registration failed"
            );
        }

        return response.json();
    }

    async function login(data: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            throw new Error(
                errorData?.message ?? "Login failed"
            );
        }

        const loginResponse: LoginResponse = await response.json();

        localStorage.setItem("token", loginResponse.token);
        localStorage.setItem("user", JSON.stringify(loginResponse.user));

        return loginResponse;
    }

    return {
        register,
        login,
    };
}