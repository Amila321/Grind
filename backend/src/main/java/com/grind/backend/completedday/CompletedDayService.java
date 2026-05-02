package com.grind.backend.completedday;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.grind.backend.habit.HabitCompletionRepository;
import com.grind.backend.habit.HabitModel;
import com.grind.backend.habit.HabitRepository;
import com.grind.backend.user.UserModel;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompletedDayService {

    private final CompletedDayRepository completedDayRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;

    public CompletedDayService(
            CompletedDayRepository completedDayRepository,
            HabitRepository habitRepository,
            HabitCompletionRepository habitCompletionRepository
    ) {
        this.completedDayRepository = completedDayRepository;
        this.habitRepository = habitRepository;
        this.habitCompletionRepository = habitCompletionRepository;
    }

    @Transactional
    public void syncCompletedDayForUser(UserModel user, LocalDate day) {
        List<HabitModel> habits = habitRepository.findByUserOrderByPositionAsc(user);

        if (habits.isEmpty()) {
            deleteCompletedDayIfExists(user, day);
            return;
        }

        Set<Long> completedHabitIds = habitCompletionRepository
                .findByHabitInAndCompletionDate(habits, day)
                .stream()
                .map(completion -> completion.getHabit().getId())
                .collect(Collectors.toSet());

        int completedCount = completedHabitIds.size();
        int totalCount = habits.size();

        boolean isDayFullyCompleted = totalCount > 0 && completedCount == totalCount;

        if (isDayFullyCompleted) {
            createCompletedDayIfNotExists(user, day);
        } else {
            deleteCompletedDayIfExists(user, day);
        }
    }

    @Transactional(readOnly = true)
    public boolean isCompletedDay(UserModel user, LocalDate day) {
        return completedDayRepository.existsByUserAndDay(user, day);
    }

    private void createCompletedDayIfNotExists(UserModel user, LocalDate day) {
        boolean alreadyExists = completedDayRepository.existsByUserAndDay(user, day);

        if (alreadyExists) {
            return;
        }

        CompletedDayModel completedDay = CompletedDayModel.builder()
                .user(user)
                .day(day)
                .build();

        completedDayRepository.save(completedDay);
    }

    @Transactional(readOnly = true)
    public long countCompletedDaysForUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user id");
        }

        return completedDayRepository.countByUser_Id(userId);
    }

    @Transactional(readOnly = true)
    public List<CompletedDaysResponse> getCompletedDaysByUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user id");
        }

        return completedDayRepository.findByUser_IdOrderByDayAsc(userId)
                .stream()
                .map(CompletedDaysResponse::fromModel)
                .toList();
    }

    private void deleteCompletedDayIfExists(UserModel user, LocalDate day) {
        boolean exists = completedDayRepository.existsByUserAndDay(user, day);

        if (!exists) {
            return;
        }

        completedDayRepository.deleteByUserAndDay(user, day);
    }
}