package com.grind.backend.completedday;

import java.time.LocalDate;

public record CompletedDaysResponse(
        Long id,
        LocalDate day
) {
    public static CompletedDaysResponse fromModel(CompletedDayModel completedDay) {
        return new CompletedDaysResponse(
                completedDay.getId(),
                completedDay.getDay()
        );
    }
}