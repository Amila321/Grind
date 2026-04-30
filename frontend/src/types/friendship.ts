export type UserDto = {
    id: number;
    username: string;
};

export type FriendshipStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type FriendshipDto = {
    id: number;
    requester: UserDto;
    addressee: UserDto;
    status: FriendshipStatus;
};

export type FriendshipState = {
    friends: UserDto[];
    receivedInvitations: FriendshipDto[];
    sentInvitations: FriendshipDto[];
    isLoading: boolean;
    error: string | null;
};

export type FriendshipActions = {
    sendInvitation: (username: string) => Promise<void>;
    acceptInvitation: (friendshipId: number) => Promise<void>;
    rejectInvitation: (friendshipId: number) => Promise<void>;
    removeFriend: (friendId: number) => Promise<void>;
    refreshAll: () => Promise<void>;
};

export type UseFriendshipReturn = FriendshipState & FriendshipActions;
