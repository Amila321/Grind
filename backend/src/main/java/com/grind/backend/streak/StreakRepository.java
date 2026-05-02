package com.grind.backend.streak;

import java.util.Optional;

import com.grind.backend.user.UserModel;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StreakRepository extends JpaRepository<StreakModel, Long> {

    Optional<StreakModel> findByUser(UserModel user);

    Optional<StreakModel> findByUser_Id(Long userId);

    boolean existsByUser(UserModel user);
}