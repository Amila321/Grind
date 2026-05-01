package com.grind.backend.habit;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitCompletionRepository extends JpaRepository<HabitCompletionModel, Long> {

    Optional<HabitCompletionModel> findByHabitAndCompletionDate(
            HabitModel habit,
            LocalDate completionDate
    );

    boolean existsByHabitAndCompletionDate(
            HabitModel habit,
            LocalDate completionDate
    );

    List<HabitCompletionModel> findByHabitInAndCompletionDate(
            List<HabitModel> habits,
            LocalDate completionDate
    );

    void deleteByHabitAndCompletionDate(
            HabitModel habit,
            LocalDate completionDate
    );
}