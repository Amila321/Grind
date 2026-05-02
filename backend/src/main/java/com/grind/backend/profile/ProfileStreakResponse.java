package com.grind.backend.profile;

public record ProfileStreakResponse(
        int currentStreak,
        int bestStreak
) {
}