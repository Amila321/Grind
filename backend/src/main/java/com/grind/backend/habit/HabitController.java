package com.grind.backend.habit;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import com.grind.backend.auth.TokenService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/habit")
public class HabitController {

    private final HabitService habitService;
    private final TokenService tokenService;

    public HabitController(
            HabitService habitService,
            TokenService tokenService
    ) {
        this.habitService = habitService;
        this.tokenService = tokenService;
    }

    @GetMapping("/habits")
    public ResponseEntity<?> getHabits(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            List<HabitResponse> habits = habitService.getHabits(currentUserId)
                    .stream()
                    .map(HabitResponse::fromModel)
                    .toList();

            return ResponseEntity.ok(habits);

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return notFound(exception.getMessage());
        }
    }

    @PostMapping("/habits")
    public ResponseEntity<?> addHabit(
            @Valid @RequestBody AddHabitRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            HabitModel createdHabit = habitService.addHabit(
                    currentUserId,
                    request.title(),
                    request.description()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(HabitResponse.fromModel(createdHabit));

        } catch (IllegalArgumentException exception) {
            return badRequest(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return notFound(exception.getMessage());
        }
    }

    @PutMapping("/habits/{habitId}")
    public ResponseEntity<?> editHabit(
            @PathVariable Long habitId,
            @Valid @RequestBody UpdateHabitRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            HabitResponse habitToUpdate = new HabitResponse(
                    habitId,
                    request.title(),
                    request.description(),
                    request.position()
            );

            HabitModel updatedHabit = habitService.editHabit(
                    currentUserId,
                    habitToUpdate
            );

            return ResponseEntity.ok(HabitResponse.fromModel(updatedHabit));

        } catch (IllegalArgumentException exception) {
            return badRequest(exception.getMessage());

        } catch (SecurityException exception) {
            return forbidden(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return notFound(exception.getMessage());
        }
    }

    @DeleteMapping("/habits/{habitId}")
    public ResponseEntity<?> deleteHabit(
            @PathVariable Long habitId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            habitService.deleteHabit(currentUserId, habitId);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (SecurityException exception) {
            return forbidden(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return notFound(exception.getMessage());
        }
    }

    @PostMapping("/habits/{habitId}/completions/today")
    public ResponseEntity<?> completeHabitToday(
            @PathVariable Long habitId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            HabitCompletionModel completion = habitService.completeHabitToday(
                    currentUserId,
                    habitId
            );

            return ResponseEntity.ok(HabitCompletionResponse.fromModel(completion));

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (SecurityException exception) {
            return forbidden(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return notFound(exception.getMessage());
        }
    }

    @DeleteMapping("/habits/{habitId}/completions/today")
    public ResponseEntity<?> uncompleteHabitToday(
            @PathVariable Long habitId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            habitService.uncompleteHabitToday(currentUserId, habitId);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (SecurityException exception) {
            return forbidden(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return notFound(exception.getMessage());
        }
    }

    private Long extractCurrentUserId(String authorizationHeader) {
        String token = extractTokenFromHeader(authorizationHeader);

        try {
            return tokenService.extractUserId(token);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid or expired token");
        }
    }

    private String extractTokenFromHeader(String authorizationHeader) {
        String bearerPrefix = "Bearer ";

        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new IllegalArgumentException("Authorization header is required");
        }

        if (!authorizationHeader.startsWith(bearerPrefix)) {
            throw new IllegalArgumentException("Authorization header must start with Bearer");
        }

        return authorizationHeader.substring(bearerPrefix.length());
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "message", message
        ));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "message", message
        ));
    }

    private ResponseEntity<Map<String, String>> notFound(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "message", message
        ));
    }

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of(
                "message", message
        ));
    }
}