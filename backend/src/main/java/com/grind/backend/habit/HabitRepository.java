package com.grind.backend.habit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<HabitModel, Long> {

    List<HabitModel> findByHabitListOrderByPositionAsc(HabitListModel habitList);

    boolean existsByHabitListAndPosition(
            HabitListModel habitList,
            Integer position
    );
}