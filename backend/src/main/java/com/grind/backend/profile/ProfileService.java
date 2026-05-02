package com.grind.backend.profile;

import java.util.List;
import java.util.NoSuchElementException;

import com.grind.backend.completedday.CompletedDayService;
import com.grind.backend.completedday.CompletedDaysResponse;
import com.grind.backend.streak.StreakResponse;
import com.grind.backend.streak.StreakService;
import com.grind.backend.user.UserDto;
import com.grind.backend.user.UserModel;
import com.grind.backend.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final CompletedDayService completedDayService;
    private final StreakService streakService;

    public ProfileService(
            UserRepository userRepository,
            CompletedDayService completedDayService,
            StreakService streakService
    ) {
        this.userRepository = userRepository;
        this.completedDayService = completedDayService;
        this.streakService = streakService;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileByUserId(Long userId) {
        UserModel user = getUserById(userId);

        long completedDaysCount = completedDayService.countCompletedDaysForUser(userId);

        List<CompletedDaysResponse> completedDays = completedDayService
                .getCompletedDaysByUserId(userId);

        StreakResponse streak = streakService.getStreakForUser(userId);

        ProfileStreakResponse profileStreak = new ProfileStreakResponse(
                streak.currentStreak(),
                streak.bestStreak()
        );

        return new ProfileResponse(
                UserDto.fromModel(user),
                completedDaysCount,
                completedDays,
                profileStreak
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