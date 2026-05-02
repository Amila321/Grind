package com.grind.backend.habit;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

import com.grind.backend.user.UserModel;
import com.grind.backend.user.UserRepository;
import com.grind.backend.completedday.CompletedDayService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grind.backend.realtime.HabitRealtimeEvent;
import com.grind.backend.realtime.RealtimeService;
import com.grind.backend.user.UserDto;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final UserRepository userRepository;
    private final RealtimeService realtimeService;
    private final CompletedDayService completedDayService;

    public HabitService(
            HabitRepository habitRepository,
            HabitCompletionRepository habitCompletionRepository,
            UserRepository userRepository,
            RealtimeService realtimeService,
            CompletedDayService completedDayService
    ) {
        this.habitRepository = habitRepository;
        this.habitCompletionRepository = habitCompletionRepository;
        this.userRepository = userRepository;
        this.realtimeService = realtimeService;
        this.completedDayService = completedDayService;
    }


    @Transactional(readOnly = true)
    public List<HabitModel> getHabits(Long currentUserId) {
        // Validate userId before querying
        if (currentUserId == null || currentUserId <= 0) {
            throw new IllegalArgumentException("Invalid user id: must be a positive number");
        }

        UserModel user = getUserById(currentUserId);

        // getUserById validates user exists and throws NoSuchElementException if not
        return habitRepository.findByUserOrderByPositionAsc(user);
    }

    @Transactional
    public HabitModel addHabit(
            Long currentUserId,
            String title,
            String description
    ) {
        validateTitle(title);

        UserModel user = getUserById(currentUserId);

        List<HabitModel> currentHabits = habitRepository.findByUserOrderByPositionAsc(user);

        int nextPosition = currentHabits.stream()
                .map(HabitModel::getPosition)
                .max(Comparator.naturalOrder())
                .orElse(0) + 1;

        HabitModel habit = HabitModel.builder()
                .user(user)
                .title(title.trim())
                .description(normalizeDescription(description))
                .position(nextPosition)
                .build();

        HabitModel savedHabit = habitRepository.save(habit);

        LocalDate today = LocalDate.now();

        completedDayService.syncCompletedDayForUser(user, today);

        HabitRealtimeEvent event = new HabitRealtimeEvent(
                "HABIT_CREATED",
                UserDto.fromModel(user),
                savedHabit.getId(),
                savedHabit.getTitle(),
                LocalDate.now(),
                false
        );

        realtimeService.publishHabitEventToUserAndFriends(user, event);

        return savedHabit;
    }


    @Transactional
    public HabitCompletionModel completeHabitToday(Long currentUserId, Long habitId) {
        HabitModel habit = getHabitById(habitId);

        validateHabitBelongsToUser(habit, currentUserId);

        LocalDate today = LocalDate.now();

        HabitCompletionModel completion = habitCompletionRepository
                .findByHabitAndCompletionDate(habit, today)
                .orElseGet(() -> {
                    HabitCompletionModel newCompletion = HabitCompletionModel.builder()
                            .habit(habit)
                            .completionDate(today)
                            .build();

                    return habitCompletionRepository.save(newCompletion);
                });

        UserModel actor = habit.getUser();

        completedDayService.syncCompletedDayForUser(actor, today);

        HabitRealtimeEvent event = new HabitRealtimeEvent(
                "HABIT_COMPLETED",
                UserDto.fromModel(actor),
                habit.getId(),
                habit.getTitle(),
                today,
                true
        );

        realtimeService.publishHabitEventToUserAndFriends(actor, event);

        return completion;
    }

    @Transactional
    public void uncompleteHabitToday(Long currentUserId, Long habitId) {
        HabitModel habit = getHabitById(habitId);

        validateHabitBelongsToUser(habit, currentUserId);

        LocalDate today = LocalDate.now();

        habitCompletionRepository.deleteByHabitAndCompletionDate(habit, today);

        UserModel actor = habit.getUser();

        completedDayService.syncCompletedDayForUser(actor, today);

        HabitRealtimeEvent event = new HabitRealtimeEvent(
                "HABIT_UNCOMPLETED",
                UserDto.fromModel(actor),
                habit.getId(),
                habit.getTitle(),
                today,
                false
        );

        realtimeService.publishHabitEventToUserAndFriends(actor, event);
    }

    @Transactional
    public HabitModel editHabit(
            Long currentUserId,
            HabitResponse habitResponse
    ) {
        if (currentUserId == null || currentUserId <= 0) {
            throw new IllegalArgumentException("Invalid user id: must be a positive number");
        }

        if (habitResponse == null) {
            throw new IllegalArgumentException("Habit response cannot be null");
        }

        if (habitResponse.id() == null || habitResponse.id() <= 0) {
            throw new IllegalArgumentException("Invalid habit id");
        }

        validateTitle(habitResponse.title());

        if (habitResponse.position() != null && habitResponse.position() <= 0) {
            throw new IllegalArgumentException("Position must be a positive number");
        }

        HabitModel habit = getHabitById(habitResponse.id());
        validateHabitBelongsToUser(habit, currentUserId);

        LocalDate today = LocalDate.now();

        boolean wasCompletedToday = habitCompletionRepository.existsByHabitAndCompletionDate(
                habit,
                today
        );

        if (wasCompletedToday) {
            habitCompletionRepository.deleteByHabitAndCompletionDate(habit, today);
        }

        habit.setTitle(habitResponse.title().trim());
        habit.setDescription(normalizeDescription(habitResponse.description()));

        if (habitResponse.position() != null) {
            habit.setPosition(habitResponse.position());
        }

        HabitModel updatedHabit = habitRepository.save(habit);

        UserModel actor = updatedHabit.getUser();

        completedDayService.syncCompletedDayForUser(actor, today);

        HabitRealtimeEvent event = new HabitRealtimeEvent(
                "HABIT_UPDATED",
                UserDto.fromModel(actor),
                updatedHabit.getId(),
                updatedHabit.getTitle(),
                today,
                false
        );

        realtimeService.publishHabitEventToUserAndFriends(actor, event);

        return updatedHabit;
    }

    @Transactional
    public void deleteHabit(Long currentUserId, Long habitId) {
        HabitModel habit = getHabitById(habitId);

        validateHabitBelongsToUser(habit, currentUserId);

        UserModel actor = habit.getUser();
        Long deletedHabitId = habit.getId();
        String deletedHabitTitle = habit.getTitle();

        LocalDate today = LocalDate.now();

        habitCompletionRepository.deleteByHabit(habit);
        habitRepository.delete(habit);

        completedDayService.syncCompletedDayForUser(actor, today);

        HabitRealtimeEvent event = new HabitRealtimeEvent(
                "HABIT_DELETED",
                UserDto.fromModel(actor),
                deletedHabitId,
                deletedHabitTitle,
                LocalDate.now(),
                false
        );

        realtimeService.publishHabitEventToUserAndFriends(actor, event);
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

    private HabitModel getHabitById(Long habitId) {
        return habitRepository.findById(habitId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Habit with id " + habitId + " not found"
                ));
    }



    private void validateHabitBelongsToUser(HabitModel habit, Long currentUserId) {
        Long ownerId = habit.getUser().getId();

        if (!Objects.equals(ownerId, currentUserId)) {
            throw new SecurityException("You can manage only your own habits");
        }
    }


    private void validateTitle(String title) {
        if (title == null || title.trim().isBlank()) {
            throw new IllegalArgumentException("Habit title is required");
        }

        if (title.trim().length() > 100) {
            throw new IllegalArgumentException("Habit title can have max 100 characters");
        }
    }

    private String normalizeDescription(String description) {
        if (description == null || description.trim().isBlank()) {
            return null;
        }

        if (description.trim().length() > 500) {
            throw new IllegalArgumentException("Habit description can have max 500 characters");
        }

        return description.trim();
    }
}