package com.grind.backend.streak;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

import com.grind.backend.completedday.CompletedDayModel;
import com.grind.backend.completedday.CompletedDayRepository;
import com.grind.backend.user.UserModel;
import com.grind.backend.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StreakService {

    private final StreakRepository streakRepository;
    private final CompletedDayRepository completedDayRepository;
    private final UserRepository userRepository;

    public StreakService(
            StreakRepository streakRepository,
            CompletedDayRepository completedDayRepository,
            UserRepository userRepository
    ) {
        this.streakRepository = streakRepository;
        this.completedDayRepository = completedDayRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public int calculateCurrentStreak(Long userId) {
        UserModel user = getUserById(userId);

        return calculateCurrentStreak(user, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public int calculateCurrentStreak(UserModel user, LocalDate today) {
        List<CompletedDayModel> completedDays = completedDayRepository
                .findByUser_IdOrderByDayAsc(user.getId());

        Set<LocalDate> completedDaysSet = completedDays.stream()
                .map(CompletedDayModel::getDay)
                .collect(Collectors.toSet());

        LocalDate cursor = today;

        if (!completedDaysSet.contains(cursor)) {
            cursor = cursor.minusDays(1);
        }

        int streak = 0;

        while (completedDaysSet.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    @Transactional(readOnly = true)
    public int getBestStreak(Long userId) {
        return streakRepository.findByUser_Id(userId)
                .map(StreakModel::getBestStreak)
                .orElse(0);
    }

    @Transactional
    public StreakModel syncBestStreak(UserModel user, LocalDate today) {
        int currentStreak = calculateCurrentStreak(user, today);

        StreakModel streak = getOrCreateStreakModel(user);

        if (currentStreak > streak.getBestStreak()) {
            streak.setBestStreak(currentStreak);
            return streakRepository.save(streak);
        }

        return streak;
    }

    private StreakModel getOrCreateStreakModel(UserModel user) {
        return streakRepository.findByUser(user)
                .orElseGet(() -> {
                    StreakModel streak = StreakModel.builder()
                            .user(user)
                            .bestStreak(0)
                            .build();

                    return streakRepository.save(streak);
                });
    }

    @Transactional(readOnly = true)
    public StreakResponse getStreakForUser(Long userId) {
        int currentStreak = calculateCurrentStreak(userId);
        int bestStreak = getBestStreak(userId);

        return new StreakResponse(
                currentStreak,
                bestStreak
        );
    }

    private UserModel getUserById(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user id");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException(
                        "User with id " + userId + " not found"
                ));
    }
}