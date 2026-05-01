package com.grind.backend.realtime;

import java.time.LocalDate;

import com.grind.backend.user.UserDto;

public record HabitRealtimeEvent(
        String type,
        UserDto actor,
        Long habitId,
        String habitTitle,
        LocalDate completionDate,
        boolean completedToday
) {
}