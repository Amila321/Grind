package com.grind.backend.streak;

import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/streaks")
public class StreakController {

    private final StreakService streakService;

    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getStreakByUserId(@PathVariable Long userId) {
        try {
            StreakResponse streak = streakService.getStreakForUser(userId);

            return ResponseEntity.ok(streak);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();
        }
    }
}