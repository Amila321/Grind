package com.grind.backend.user;

import java.util.NoSuchElementException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserDto createUser(String username, String rawPassword) {
        validateUsername(username);
        validatePassword(rawPassword);

        String normalizedUsername = username.trim();

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalStateException("Username is already taken");
        }

        String passwordHash = passwordEncoder.encode(rawPassword);

        UserModel user = UserModel.builder()
                .username(normalizedUsername)
                .passwordHash(passwordHash)
                .build();

        UserModel savedUser = userRepository.save(user);

        return UserDto.fromModel(savedUser);
    }

    @Transactional
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("User with id " + id + " not found");
        }

        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteUserByUsername(String username) {
        validateUsername(username);

        String normalizedUsername = username.trim();

        UserModel user = userRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new NoSuchElementException(
                        "User with username " + normalizedUsername + " not found"
                ));

        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        validateUsername(username);

        String normalizedUsername = username.trim();

        UserModel user = userRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new NoSuchElementException(
                        "User with username " + normalizedUsername + " not found"
                ));

        return UserDto.fromModel(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "User with id " + id + " not found"
                ));

        return UserDto.fromModel(user);
    }

    private void validateUsername(String username) {
        if (username == null || username.trim().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (username.trim().length() < 3) {
            throw new IllegalArgumentException("Username must have at least 3 characters");
        }

        if (username.trim().length() > 50) {
            throw new IllegalArgumentException("Username can have max 50 characters");
        }
    }

    private void validatePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (rawPassword.length() < 6) {
            throw new IllegalArgumentException("Password must have at least 6 characters");
        }
    }
}