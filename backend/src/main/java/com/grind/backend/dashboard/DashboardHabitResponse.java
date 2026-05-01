package com.grind.backend.dashboard;

public record DashboardHabitResponse(
        Long id,
        String title,
        String description,
        Integer position,
        boolean completedToday
) {
}