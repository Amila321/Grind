import type { UserDto } from "../../types/friendship";

interface FriendCardProps {
    friend: UserDto;
}

export function FriendCard({ friend }: FriendCardProps) {
    const initial = friend.username.charAt(0).toUpperCase();

    return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initial}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">@{friend.username}</p>
            </div>
        </div>
    );
}
