package com.grind.backend.profile;

import java.util.List;

import com.grind.backend.completedday.CompletedDaysResponse;
import com.grind.backend.user.UserDto;

public record ProfileResponse(
        UserDto user,
        long completedDaysCount,
        List<CompletedDaysResponse> completedDays,
        ProfileStreakResponse streak
) {
}