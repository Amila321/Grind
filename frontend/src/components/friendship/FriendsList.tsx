import { Users } from "lucide-react";
import type { UserDto } from "../../types/friendship";
import { FriendCard } from "./FriendCard";

interface FriendsListProps {
    friends: UserDto[];
    isLoading: boolean;
    onRemove: (friendId: number) => Promise<void>;
}

export function FriendsList({ friends, isLoading, onRemove }: FriendsListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-[72px] animate-pulse rounded-xl border border-border bg-muted"
                    />
                ))}
            </div>
        );
    }

    if (friends.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No friends yet</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Send an invitation to start connecting with others
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} onRemove={onRemove} />
            ))}
        </div>
    );
}
