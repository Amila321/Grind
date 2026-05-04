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
        <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shrink-0">
                {initial}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground text-sm sm:text-base">@{user.username}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {type === "received" ? "Wants to be your friend" : "Awaiting response"}
                </p>
            </div>

            {type === "received" && onAccept && onReject ? (
                <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onAccept}
                        disabled={isActionLoading}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Accept invitation"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onReject}
                        disabled={isActionLoading}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Reject invitation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-secondary-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    Pending
                </div>
            )}
        </div>
    );
}
