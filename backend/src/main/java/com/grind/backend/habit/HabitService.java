package com.grind.backend.habit;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

import com.grind.backend.user.UserModel;
import com.grind.backend.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grind.backend.realtime.HabitRealtimeEvent;
import com.grind.backend.realtime.RealtimeService;
import com.grind.backend.user.UserDto;

@Service
public class HabitService {

    private final HabitListRepository habitListRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final UserRepository userRepository;
    private final RealtimeService realtimeService;

    public HabitService(
            HabitListRepository habitListRepository,
            HabitRepository habitRepository,
            HabitCompletionRepository habitCompletionRepository,
            UserRepository userRepository,
            RealtimeService realtimeService
    ) {
        this.habitListRepository = habitListRepository;
        this.habitRepository = habitRepository;
        this.habitCompletionRepository = habitCompletionRepository;
        this.userRepository = userRepository;
        this.realtimeService = realtimeService;
    }

    @Transactional
    public HabitListModel getOrCreateDraftList(Long currentUserId) {
        UserModel currentUser = getUserById(currentUserId);

        return habitListRepository
                .findByUserAndStatus(currentUser, HabitListStatus.DRAFT)
                .orElseGet(() -> {
                    HabitListModel draftList = HabitListModel.builder()
                            .user(currentUser)
                            .status(HabitListStatus.DRAFT)
                            .build();

                    return habitListRepository.save(draftList);
                });
    }

    @Transactional(readOnly = true)
    public List<HabitModel> getDraftHabits(Long currentUserId) {
        HabitListModel draftList = getDraftListForUser(currentUserId);

        return habitRepository.findByHabitListOrderByPositionAsc(draftList);
    }

    @Transactional
    public HabitModel addHabitToDraft(
            Long currentUserId,
            String title,
            String description
    ) {
        validateTitle(title);

        HabitListModel draftList = getOrCreateDraftList(currentUserId);

        List<HabitModel> currentHabits = habitRepository.findByHabitListOrderByPositionAsc(draftList);

        int nextPosition = currentHabits.stream()
                .map(HabitModel::getPosition)
                .max(Comparator.naturalOrder())
                .orElse(0) + 1;

        HabitModel habit = HabitModel.builder()
                .habitList(draftList)
                .title(title.trim())
                .description(normalizeDescription(description))
                .position(nextPosition)
                .build();

        return habitRepository.save(habit);
    }

    @Transactional
    public HabitListModel publishDraftList(Long currentUserId) {
        HabitListModel draftList = getDraftListForUser(currentUserId);

        List<HabitModel> draftHabits = habitRepository.findByHabitListOrderByPositionAsc(draftList);

        if (draftHabits.isEmpty()) {
            throw new IllegalStateException("Cannot publish empty habit list");
        }

        boolean activeListAlreadyExists = habitListRepository.existsByUserAndStatus(
                draftList.getUser(),
                HabitListStatus.ACTIVE
        );

        if (activeListAlreadyExists) {
            throw new IllegalStateException("Active habit list already exists");
        }

        draftList.setStatus(HabitListStatus.ACTIVE);

        return habitListRepository.save(draftList);
    }

    @Transactional(readOnly = true)
    public List<HabitModel> getMyActiveHabits(Long currentUserId) {
        HabitListModel activeList = getActiveListForUser(currentUserId);

        return habitRepository.findByHabitListOrderByPositionAsc(activeList);
    }

    @Transactional
    public HabitCompletionModel completeHabitToday(Long currentUserId, Long habitId) {
        HabitModel habit = getHabitById(habitId);

        validateHabitBelongsToUser(habit, currentUserId);
        validateHabitIsActive(habit);

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

        UserModel actor = habit.getHabitList().getUser();

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
        validateHabitIsActive(habit);

        LocalDate today = LocalDate.now();

        habitCompletionRepository.deleteByHabitAndCompletionDate(habit, today);

        UserModel actor = habit.getHabitList().getUser();

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
    public void deleteHabitFromDraft(Long currentUserId, Long habitId) {
        HabitModel habit = getHabitById(habitId);

        validateHabitBelongsToUser(habit, currentUserId);

        if (habit.getHabitList().getStatus() != HabitListStatus.DRAFT) {
            throw new IllegalStateException("Only draft habits can be deleted");
        }

        habitRepository.delete(habit);
    }

    private UserModel getUserById(Long userId) {
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

    private HabitListModel getDraftListForUser(Long currentUserId) {
        UserModel currentUser = getUserById(currentUserId);

        return habitListRepository.findByUserAndStatus(currentUser, HabitListStatus.DRAFT)
                .orElseThrow(() -> new NoSuchElementException(
                        "Draft habit list not found"
                ));
    }

    private HabitListModel getActiveListForUser(Long currentUserId) {
        UserModel currentUser = getUserById(currentUserId);

        return habitListRepository.findByUserAndStatus(currentUser, HabitListStatus.ACTIVE)
                .orElseThrow(() -> new NoSuchElementException(
                        "Active habit list not found"
                ));
    }

    private void validateHabitBelongsToUser(HabitModel habit, Long currentUserId) {
        Long ownerId = habit.getHabitList().getUser().getId();

        if (!Objects.equals(ownerId, currentUserId)) {
            throw new SecurityException("You can manage only your own habits");
        }
    }

    private void validateHabitIsActive(HabitModel habit) {
        if (habit.getHabitList().getStatus() != HabitListStatus.ACTIVE) {
            throw new IllegalStateException("Only active habits can be completed");
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