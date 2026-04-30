import { useState } from "react";
import { Inbox } from "lucide-react";
import type { FriendshipDto } from "../../types/friendship";
import { InvitationCard } from "./InvitationCard";

interface IncomingInvitationsProps {
    invitations: FriendshipDto[];
    onAccept: (friendshipId: number) => Promise<void>;
    onReject: (friendshipId: number) => Promise<void>;
    isLoading: boolean;
}

export function IncomingInvitations({
    invitations,
    onAccept,
    onReject,
    isLoading,
}: IncomingInvitationsProps) {
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    async function handleAccept(friendshipId: number) {
        setActionLoadingId(friendshipId);
        setActionError(null);
        try {
            await onAccept(friendshipId);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to accept");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleReject(friendshipId: number) {
        setActionLoadingId(friendshipId);
        setActionError(null);
        try {
            await onReject(friendshipId);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to reject");
        } finally {
            setActionLoadingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-[72px] animate-pulse rounded-xl border border-border bg-muted"
                    />
                ))}
            </div>
        );
    }

    if (invitations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No pending invitations</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    When someone sends you a friend request, it will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {actionError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {actionError}
                </p>
            )}
            {invitations.map((invitation) => (
                <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    type="received"
                    onAccept={() => handleAccept(invitation.id)}
                    onReject={() => handleReject(invitation.id)}
                    isActionLoading={actionLoadingId === invitation.id}
                />
            ))}
        </div>
    );
}
