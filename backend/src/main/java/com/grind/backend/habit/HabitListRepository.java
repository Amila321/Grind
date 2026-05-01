package com.grind.backend.habit;

import java.util.Optional;

import com.grind.backend.user.UserModel;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitListRepository extends JpaRepository<HabitListModel, Long> {

    Optional<HabitListModel> findByUserAndStatus(
            UserModel user,
            HabitListStatus status
    );

    boolean existsByUserAndStatus(
            UserModel user,
            HabitListStatus status
    );
}