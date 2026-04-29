package com.grind.backend.user;

import java.net.URI;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;

import com.grind.backend.auth.TokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;

    public UserController(
            UserService userService,
            TokenService tokenService
    ) {
        this.userService = userService;
        this.tokenService = tokenService;
    }


    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            UserDto createdUser = userService.createUser(
                    request.username(),
                    request.password()
            );

            return ResponseEntity
                    .created(URI.create("/api/users/" + createdUser.id()))
                    .body(createdUser);

        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserDto user = userService.getUserById(id);
            return ResponseEntity.ok(user);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            UserDto user = userService.getUserByUsername(username);
            return ResponseEntity.ok(user);

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            String token = extractTokenFromHeader(authorizationHeader);
            Long tokenUserId = tokenService.extractUserId(token);

            if (!Objects.equals(tokenUserId, id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message", "You can delete only your own account"
                ));
            }

            userService.deleteUserById(id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid or expired token"
            ));
        }
    }

    @DeleteMapping("/by-username/{username}")
    public ResponseEntity<?> deleteUserByUsername(
            @PathVariable String username,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            String token = extractTokenFromHeader(authorizationHeader);
            String tokenUsername = tokenService.extractUsername(token);

            if (!tokenUsername.equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message", "You can delete only your own account"
                ));
            }

            userService.deleteUserByUsername(username);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (NoSuchElementException exception) {
            return ResponseEntity.notFound().build();

        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid or expired token"
            ));
        }
    }

    public record CreateUserRequest(
            @NotBlank(message = "Username is required")
            @Size(min = 3, max = 50, message = "Username must have between 3 and 50 characters")
            String username,

            @NotBlank(message = "Password is required")
            @Size(min = 6, max = 100, message = "Password must have between 6 and 100 characters")
            String password
    ) {
    }

    private String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new IllegalArgumentException("Authorization header is required");
        }

        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header must start with Bearer");
        }

        return authorizationHeader.substring(7);
    }
}