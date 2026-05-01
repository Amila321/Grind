package com.grind.backend.habit;

public record HabitResponse(
        Long id,
        String title,
        String description,
        Integer position
) {
    public static HabitResponse fromModel(HabitModel habit) {
        return new HabitResponse(
                habit.getId(),
                habit.getTitle(),
                habit.getDescription(),
                habit.getPosition()
        );
    }
}