package com.grind.backend.user;

public record UserDto(
        Long id,
        String username
) {
    public static UserDto fromModel(UserModel user) {
        return new UserDto(
                user.getId(),
                user.getUsername()
        );
    }
}