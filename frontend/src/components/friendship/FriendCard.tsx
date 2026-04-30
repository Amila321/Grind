import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import type { UserDto } from "../../types/friendship";

interface FriendCardProps {
    friend: UserDto;
    onRemove: (friendId: number) => Promise<void>;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
    const [isRemoving, setIsRemoving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const initial = friend.username.charAt(0).toUpperCase();

    async function handleRemove() {
        setIsRemoving(true);
        try {
            await onRemove(friend.id);
        } catch {
            // Error handling is managed by the parent/hook
        } finally {
            setIsRemoving(false);
            setShowConfirm(false);
        }
    }

    return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initial}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">@{friend.username}</p>
            </div>

            {showConfirm ? (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRemoving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            "Confirm"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowConfirm(false)}
                        disabled={isRemoving}
                        className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${friend.username} from friends`}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
