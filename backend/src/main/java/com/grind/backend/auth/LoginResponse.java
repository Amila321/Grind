package com.grind.backend.auth;

import com.grind.backend.user.UserDto;

public record LoginResponse(
        String token,
        UserDto user
) {
}