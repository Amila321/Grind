package com.grind.backend.dashboard;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.grind.backend.friendship.FriendshipModel;
import com.grind.backend.friendship.FriendshipRepository;
import com.grind.backend.friendship.FriendshipStatus;
import com.grind.backend.habit.HabitCompletionRepository;
import com.grind.backend.habit.HabitModel;
import com.grind.backend.habit.HabitRepository;
import com.grind.backend.user.UserDto;
import com.grind.backend.user.UserModel;
import com.grind.backend.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;

    public DashboardService(
            UserRepository userRepository,
            FriendshipRepository friendshipRepository,
            HabitRepository habitRepository,
            HabitCompletionRepository habitCompletionRepository
    ) {
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
        this.habitRepository = habitRepository;
        this.habitCompletionRepository = habitCompletionRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long currentUserId) {
        UserModel currentUser = getUserById(currentUserId);

        DashboardUserResponse currentUserDashboard = buildUserDashboard(currentUser);

        List<DashboardUserResponse> friendsDashboard = friendshipRepository
                .findAllByUserAndStatus(currentUser, FriendshipStatus.ACCEPTED)
                .stream()
                .map(friendship -> getOtherUser(friendship, currentUser))
                .map(this::buildUserDashboard)
                .toList();

        return new DashboardResponse(
                currentUserDashboard,
                friendsDashboard
        );
    }

    private DashboardUserResponse buildUserDashboard(UserModel user) {
        List<HabitModel> habits = habitRepository.findByUserOrderByPositionAsc(user);

        if (habits.isEmpty()) {
            return new DashboardUserResponse(
                    UserDto.fromModel(user),
                    List.of(),
                    0,
                    0
            );
        }

        LocalDate today = LocalDate.now();

        Set<Long> completedHabitIds = habitCompletionRepository
                .findByHabitInAndCompletionDate(habits, today)
                .stream()
                .map(completion -> completion.getHabit().getId())
                .collect(Collectors.toSet());

        List<DashboardHabitResponse> habitResponses = habits.stream()
                .map(habit -> new DashboardHabitResponse(
                        habit.getId(),
                        habit.getTitle(),
                        habit.getDescription(),
                        habit.getPosition(),
                        completedHabitIds.contains(habit.getId())
                ))
                .toList();

        int completedCount = completedHabitIds.size();
        int totalCount = habits.size();

        return new DashboardUserResponse(
                UserDto.fromModel(user),
                habitResponses,
                completedCount,
                totalCount
        );
    }

    private UserModel getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException(
                        "User with id " + userId + " not found"
                ));
    }

    private UserModel getOtherUser(FriendshipModel friendship, UserModel currentUser) {
        if (Objects.equals(friendship.getRequester().getId(), currentUser.getId())) {
            return friendship.getAddressee();
        }

        return friendship.getRequester();
    }
}