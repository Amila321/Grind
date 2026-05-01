import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type UserDto = {
    id: number;
    username: string;
};

export type HabitRealtimeEvent = {
    type: "HABIT_COMPLETED" | "HABIT_UNCOMPLETED";
    actor: UserDto;
    habitId: number;
    habitTitle: string;
    completionDate: string;
    completedToday: boolean;
};

type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";

type UseDashboardRealtimeProps = {
    userId: number | null;
    enabled?: boolean;
    onHabitEvent?: (event: HabitRealtimeEvent) => void;
};

export function useDashboardRealtime({
                                         userId,
                                         enabled = true,
                                         onHabitEvent,
                                     }: UseDashboardRealtimeProps) {
    const onHabitEventRef = useRef(onHabitEvent);

    const [status, setStatus] = useState<ConnectionStatus>("DISCONNECTED");
    const [lastEvent, setLastEvent] = useState<HabitRealtimeEvent | null>(null);

    useEffect(() => {
        onHabitEventRef.current = onHabitEvent;
    }, [onHabitEvent]);

    useEffect(() => {
        if (!enabled || userId === null) {
            return;
        }

        let isActive = true;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws`),
            reconnectDelay: 5000,

            onConnect: () => {
                if (!isActive) return;

                setStatus("CONNECTED");

                client.subscribe(`/topic/users/${userId}/dashboard`, (message) => {
                    if (!isActive) return;

                    const event: HabitRealtimeEvent = JSON.parse(message.body);

                    setLastEvent(event);
                    onHabitEventRef.current?.(event);
                });
            },

            onStompError: () => {
                if (isActive) setStatus("ERROR");
            },

            onWebSocketError: () => {
                if (isActive) setStatus("ERROR");
            },

            onDisconnect: () => {
                if (isActive) setStatus("DISCONNECTED");
            },
        });

        // Schedule CONNECTING state asynchronously to avoid react-hooks/set-state-in-effect warning
        queueMicrotask(() => {
            if (isActive) setStatus("CONNECTING");
        });

        client.activate();

        return () => {
            isActive = false;
            client.deactivate();
        };
    }, [userId, enabled]);

    return {
        status,
        lastEvent,
    };
}