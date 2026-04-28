package com.grind.backend.health;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "grind-backend",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/api/health/db")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "database", "CONNECTED",
                    "result", result
            ));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "status", "DOWN",
                    "database", "DISCONNECTED",
                    "error", exception.getClass().getSimpleName(),
                    "message", exception.getMessage()
            ));
        }
    }
}