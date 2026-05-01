package com.grind.backend.dashboard;

import java.util.List;

import com.grind.backend.user.UserDto;

public record DashboardUserResponse(
        UserDto user,
        List<DashboardHabitResponse> habits,
        int completedCount,
        int totalCount
) {
}