package com.grind.backend.habit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grind.backend.user.UserModel;

public interface HabitRepository extends JpaRepository<HabitModel, Long> {

    List<HabitModel> findByUserOrderByPositionAsc(UserModel user);

    boolean existsByUserAndPosition(
            UserModel user,
            Integer position
    );
}