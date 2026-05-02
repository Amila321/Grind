package com.grind.backend.streak;

public record StreakResponse(
        int currentStreak,
        int bestStreak
) {
}