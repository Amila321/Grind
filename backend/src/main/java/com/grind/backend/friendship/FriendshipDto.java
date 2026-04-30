package com.grind.backend.friendship;

import com.grind.backend.user.UserDto;

public record FriendshipDto(
        Long id,
        UserDto requester,
        UserDto addressee,
        FriendshipStatus status
) {
    public static FriendshipDto fromModel(FriendshipModel friendship) {
        return new FriendshipDto(
                friendship.getId(),
                UserDto.fromModel(friendship.getRequester()),
                UserDto.fromModel(friendship.getAddressee()),
                friendship.getStatus()
        );
    }
}