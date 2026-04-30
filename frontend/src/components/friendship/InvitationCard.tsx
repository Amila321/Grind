import { Check, Clock, X } from "lucide-react";
import type { FriendshipDto } from "../../types/friendship";

interface InvitationCardProps {
    invitation: FriendshipDto;
    type: "received" | "sent";
    onAccept?: () => void;
    onReject?: () => void;
    isActionLoading?: boolean;
}

export function InvitationCard({
    invitation,
    type,
    onAccept,
    onReject,
    isActionLoading = false,
}: InvitationCardProps) {
    const user = type === "received" ? invitation.requester : invitation.addressee;
    const initial = user.username.charAt(0).toUpperCase();

    return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initial}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">@{user.username}</p>
                <p className="text-sm text-muted-foreground">
                    {type === "received" ? "Wants to be your friend" : "Awaiting response"}
                </p>
            </div>

            {type === "received" && onAccept && onReject ? (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onAccept}
                        disabled={isActionLoading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Accept invitation"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onReject}
                        disabled={isActionLoading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Reject invitation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    <Clock className="h-3 w-3" />
                    Pending
                </div>
            )}
        </div>
    );
}
