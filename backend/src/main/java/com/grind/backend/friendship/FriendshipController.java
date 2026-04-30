package com.grind.backend.friendship;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import com.grind.backend.auth.TokenService;
import com.grind.backend.user.UserDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/friendships")
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final TokenService tokenService;

    public FriendshipController(
            FriendshipService friendshipService,
            TokenService tokenService
    ) {
        this.friendshipService = friendshipService;
        this.tokenService = tokenService;
    }

    @PostMapping("/requests/{username}")
    public ResponseEntity<?> sendFriendRequest(
            @PathVariable String username,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            FriendshipDto friendship = friendshipService.sendFriendRequest(
                    currentUserId,
                    username
            );

            return ResponseEntity
                    .created(URI.create("/api/friendships/" + friendship.id()))
                    .body(friendship);

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @PatchMapping("/requests/{friendshipId}/accept")
    public ResponseEntity<?> acceptFriendRequest(
            @PathVariable Long friendshipId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            FriendshipDto friendship = friendshipService.acceptFriendRequest(
                    friendshipId,
                    currentUserId
            );

            return ResponseEntity.ok(friendship);

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (NoSuchElementException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @DeleteMapping("/requests/{friendshipId}/reject")
    public ResponseEntity<?> rejectFriendRequest(
            @PathVariable Long friendshipId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            friendshipService.rejectFriendRequest(
                    friendshipId,
                    currentUserId
            );

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (NoSuchElementException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @DeleteMapping("/friends/{username}")
    public ResponseEntity<?> removeFriend(
            @PathVariable String username,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            friendshipService.removeFriend(currentUserId, username);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", exception.getMessage()
            ));

        } catch (IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @GetMapping("/friends")
    public ResponseEntity<?> getMyFriends(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            List<UserDto> friends = friendshipService.getMyFriends(currentUserId);

            return ResponseEntity.ok(friends);

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @GetMapping("/requests/received")
    public ResponseEntity<?> getReceivedPendingRequests(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            List<FriendshipDto> requests = friendshipService.getReceivedPendingRequests(currentUserId);

            return ResponseEntity.ok(requests);

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<?> getSentPendingRequests(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            Long currentUserId = extractCurrentUserId(authorizationHeader);

            List<FriendshipDto> requests = friendshipService.getSentPendingRequests(currentUserId);

            return ResponseEntity.ok(requests);

        } catch (IllegalArgumentException exception) {
            return unauthorized(exception.getMessage());

        } catch (NoSuchElementException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", exception.getMessage()
            ));
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
}