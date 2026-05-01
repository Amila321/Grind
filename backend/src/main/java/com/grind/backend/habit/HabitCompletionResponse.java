package com.grind.backend.habit;

import java.time.LocalDate;

public record HabitCompletionResponse(
        Long id,
        Long habitId,
        LocalDate completionDate
) {
    public static HabitCompletionResponse fromModel(HabitCompletionModel completion) {
        return new HabitCompletionResponse(
                completion.getId(),
                completion.getHabit().getId(),
                completion.getCompletionDate()
        );
    }
}