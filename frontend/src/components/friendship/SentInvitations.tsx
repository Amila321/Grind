import { Send } from "lucide-react";
import type { FriendshipDto } from "../../types/friendship";
import { InvitationCard } from "./InvitationCard";

interface SentInvitationsProps {
    invitations: FriendshipDto[];
    isLoading: boolean;
}

export function SentInvitations({ invitations, isLoading }: SentInvitationsProps) {
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
                    <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No pending requests</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Requests you send will appear here until they are accepted
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {invitations.map((invitation) => (
                <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    type="sent"
                />
            ))}
        </div>
    );
}
