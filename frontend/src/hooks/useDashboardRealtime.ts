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
    const clientRef = useRef<Client | null>(null);
    const isMountedRef = useRef(true);
    const onHabitEventRef = useRef(onHabitEvent);

    // Keep callback ref updated without causing reconnection
    useEffect(() => {
        onHabitEventRef.current = onHabitEvent;
    }, [onHabitEvent]);

    const [status, setStatus] = useState<ConnectionStatus>("DISCONNECTED");
    const [lastEvent, setLastEvent] = useState<HabitRealtimeEvent | null>(null);

    useEffect(() => {
        isMountedRef.current = true;

        if (!enabled || userId === null) {
            return;
        }

        setStatus("CONNECTING");

        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws`),
            reconnectDelay: 5000,

            onConnect: () => {
                if (isMountedRef.current) setStatus("CONNECTED");

                client.subscribe(`/topic/users/${userId}/dashboard`, (message) => {
                    const event: HabitRealtimeEvent = JSON.parse(message.body);
                    if (isMountedRef.current) {
                        setLastEvent(event);
                        onHabitEventRef.current?.(event);
                    }
                });
            },

            onStompError: () => {
                if (isMountedRef.current) setStatus("ERROR");
            },

            onWebSocketError: () => {
                if (isMountedRef.current) setStatus("ERROR");
            },

            onDisconnect: () => {
                if (isMountedRef.current) setStatus("DISCONNECTED");
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            isMountedRef.current = false;
            client.deactivate();
            clientRef.current = null;
        };
    }, [userId, enabled]);

    return {
        status,
        lastEvent,
    };
}
