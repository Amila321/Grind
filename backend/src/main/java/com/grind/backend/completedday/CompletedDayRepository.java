package com.grind.backend.completedday;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.grind.backend.user.UserModel;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CompletedDayRepository extends JpaRepository<CompletedDayModel, Long> {

    Optional<CompletedDayModel> findByUserAndDay(
            UserModel user,
            LocalDate day
    );

    boolean existsByUserAndDay(
            UserModel user,
            LocalDate day
    );

    void deleteByUserAndDay(
            UserModel user,
            LocalDate day
    );

    long countByUser_Id(Long userId);

    List<CompletedDayModel> findByUser_IdOrderByDayAsc(Long userId);
}