import { useCallback, useEffect, useState } from "react";
import type {
    FriendshipDto,
    FriendshipState,
    UseFriendshipReturn,
    UserDto,
} from "../types/friendship";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message ?? `Request failed with status ${response.status}`);
    }
    return response.json();
}

export function useFriendship(): UseFriendshipReturn {
    const [state, setState] = useState<FriendshipState>({
        friends: [],
        receivedInvitations: [],
        sentInvitations: [],
        isLoading: true,
        error: null,
    });

    const fetchFriends = useCallback(async (): Promise<UserDto[]> => {
        const response = await fetch(`${API_URL}/api/friendships/friends`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        return handleResponse<UserDto[]>(response);
    }, []);

    const fetchReceivedInvitations = useCallback(async (): Promise<FriendshipDto[]> => {
        const response = await fetch(`${API_URL}/api/friendships/requests/received`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        return handleResponse<FriendshipDto[]>(response);
    }, []);

    const fetchSentInvitations = useCallback(async (): Promise<FriendshipDto[]> => {
        const response = await fetch(`${API_URL}/api/friendships/requests/sent`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        return handleResponse<FriendshipDto[]>(response);
    }, []);

    const refreshAll = useCallback(async (): Promise<void> => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const [friends, receivedInvitations, sentInvitations] = await Promise.all([
                fetchFriends(),
                fetchReceivedInvitations(),
                fetchSentInvitations(),
            ]);

            setState({
                friends,
                receivedInvitations,
                sentInvitations,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to load friendship data",
            }));
        }
    }, [fetchFriends, fetchReceivedInvitations, fetchSentInvitations]);

    const sendInvitation = useCallback(
        async (username: string): Promise<void> => {
            const response = await fetch(`${API_URL}/api/friendships/requests/${encodeURIComponent(username)}`, {
                method: "POST",
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message ?? "Failed to send friend request");
            }

            // Refresh sent invitations after successful send
            const sentInvitations = await fetchSentInvitations();
            setState((prev) => ({ ...prev, sentInvitations }));
        },
        [fetchSentInvitations]
    );

    const acceptInvitation = useCallback(
        async (friendshipId: number): Promise<void> => {
            const response = await fetch(`${API_URL}/api/friendships/requests/${friendshipId}/accept`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message ?? "Failed to accept friend request");
            }

            // Refresh friends and received invitations after accept
            const [friends, receivedInvitations] = await Promise.all([
                fetchFriends(),
                fetchReceivedInvitations(),
            ]);
            setState((prev) => ({ ...prev, friends, receivedInvitations }));
        },
        [fetchFriends, fetchReceivedInvitations]
    );

    const rejectInvitation = useCallback(
        async (friendshipId: number): Promise<void> => {
            const response = await fetch(`${API_URL}/api/friendships/requests/${friendshipId}/reject`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message ?? "Failed to reject friend request");
            }

            // Refresh received invitations after reject
            const receivedInvitations = await fetchReceivedInvitations();
            setState((prev) => ({ ...prev, receivedInvitations }));
        },
        [fetchReceivedInvitations]
    );

    const removeFriend = useCallback(
        async (friendId: number): Promise<void> => {
            const response = await fetch(`${API_URL}/api/friendships/friends/${friendId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message ?? "Failed to remove friend");
            }

            // Refresh friends list after removal
            const friends = await fetchFriends();
            setState((prev) => ({ ...prev, friends }));
        },
        [fetchFriends]
    );

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    return {
        ...state,
        sendInvitation,
        acceptInvitation,
        rejectInvitation,
        removeFriend,
        refreshAll,
    };
}
