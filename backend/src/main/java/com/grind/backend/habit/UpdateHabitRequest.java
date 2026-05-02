package com.grind.backend.habit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateHabitRequest(
        @NotBlank(message = "Habit title is required")
        @Size(max = 100, message = "Habit title can have max 100 characters")
        String title,

        @Size(max = 500, message = "Habit description can have max 500 characters")
        String description,

        Integer position
) {
}