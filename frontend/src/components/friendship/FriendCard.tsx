import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserMinus, Loader2, Trash2 } from "lucide-react";
import type { UserDto } from "../../types/friendship";

interface FriendCardProps {
    friend: UserDto;
    onRemove?: (username: string) => Promise<void>;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
    const navigate = useNavigate();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initial = friend.username.charAt(0).toUpperCase();

    function handleOpenProfile() {
        navigate(`/profile/${friend.id}`, {
            state: { username: friend.username },
        });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpenProfile();
        }
    }

    async function handleRemove(e: React.MouseEvent) {
        e.stopPropagation();
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

    function handleCancelConfirm(e: React.MouseEvent) {
        e.stopPropagation();
        setIsConfirming(false);
        setError(null);
    }

    function handleConfirmationClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    return (
        <div
            className="cursor-pointer rounded-xl border border-border bg-card transition-all hover:bg-secondary/50 hover:shadow-sm"
            onClick={handleOpenProfile}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
        >
            <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-110">
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground hover:underline">
                        @{friend.username}
                    </p>
                </div>

                {onRemove && !isConfirming && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${friend.username} from friends`}
                    >
                        <UserMinus className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Confirmation Panel */}
            {isConfirming && (
                <div
                    className="border-t border-border bg-secondary/30 px-4 py-3"
                    onClick={handleConfirmationClick}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="dialog"
                >
                    <p className="mb-3 text-sm text-muted-foreground">
                        Remove <span className="font-medium text-foreground">@{friend.username}</span> from your friends?
                    </p>

                    {error && (
                        <p className="mb-3 text-sm text-destructive">{error}</p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            aria-label="Confirm removal"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                            <span className="relative flex items-center gap-2">
                                {isRemoving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Remove Friend
                                    </>
                                )}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelConfirm}
                            disabled={isRemoving}
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:bg-secondary hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Cancel removal"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
