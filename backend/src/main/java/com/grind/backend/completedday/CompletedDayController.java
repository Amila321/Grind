package com.grind.backend.completedday;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/completed-days")
public class CompletedDayController {

    private final CompletedDayService completedDayService;

    public CompletedDayController(CompletedDayService completedDayService) {
        this.completedDayService = completedDayService;
    }

    @GetMapping("/users/{userId}/count")
    public ResponseEntity<?> countCompletedDaysByUserId(@PathVariable Long userId) {
        try {
            long count = completedDayService.countCompletedDaysForUser(userId);

            return ResponseEntity.ok(new CompletedDaysCountResponse(count));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getCompletedDaysByUserId(@PathVariable Long userId) {
        try {
            List<CompletedDaysResponse> completedDays = completedDayService
                    .getCompletedDaysByUserId(userId);

            return ResponseEntity.ok(completedDays);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    public record CompletedDaysCountResponse(
            long count
    ) {
    }
}