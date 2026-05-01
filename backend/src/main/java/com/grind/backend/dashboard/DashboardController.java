package com.grind.backend.dashboard;

import java.util.Map;
import java.util.NoSuchElementException;

import com.grind.backend.auth.TokenService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;
    private final TokenService tokenService;

    public DashboardController(
            DashboardService dashboardService,
            TokenService tokenService
    ) {
        this.dashboardService = dashboardService;
        this.tokenService = tokenService;
    }

    @GetMapping("/api/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            DashboardResponse dashboard = dashboardService.getDashboard(currentUserId);

            return ResponseEntity.ok(dashboard);

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

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

    private ResponseEntity<Map<String, String>> notFound(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "message", message
        ));
    }
}