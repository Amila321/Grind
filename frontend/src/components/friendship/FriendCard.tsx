import { useState } from "react";
import { UserMinus, X, Loader2 } from "lucide-react";
import type { UserDto } from "../../types/friendship";

interface FriendCardProps {
    friend: UserDto;
    onRemove?: (username: string) => Promise<void>;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initial = friend.username.charAt(0).toUpperCase();

    async function handleRemove() {
        if (!onRemove) return;
        
        setIsRemoving(true);
        setError(null);
        
        try {
            await onRemove(friend.username);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove friend");
            setIsConfirming(false);
        } finally {
            setIsRemoving(false);
        }
    }

    function handleCancelConfirm() {
        setIsConfirming(false);
        setError(null);
    }

    return (
        <div className="rounded-xl border border-border bg-card transition-colors hover:bg-secondary/50">
            <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">@{friend.username}</p>
                </div>
                
                {onRemove && !isConfirming && (
                    <button
                        type="button"
                        onClick={() => setIsConfirming(true)}
                        disabled={isRemoving}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${friend.username} from friends`}
                    >
                        <UserMinus className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Confirmation Panel */}
            {isConfirming && (
                <div className="border-t border-border bg-secondary/30 px-4 py-3">
                    <p className="mb-3 text-sm text-muted-foreground">
                        Remove <span className="font-medium text-foreground">@{friend.username}</span> from your friends?
                    </p>
                    
                    {error && (
                        <p className="mb-3 text-sm text-destructive">{error}</p>
                    )}
                    
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Confirm removal"
                        >
                            {isRemoving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                "Remove"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelConfirm}
                            disabled={isRemoving}
                            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Cancel removal"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
