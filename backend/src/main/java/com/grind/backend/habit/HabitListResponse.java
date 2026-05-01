package com.grind.backend.habit;

public record HabitListResponse(
        Long id,
        HabitListStatus status
) {
    public static HabitListResponse fromModel(HabitListModel habitList) {
        return new HabitListResponse(
                habitList.getId(),
                habitList.getStatus()
        );
    }
}