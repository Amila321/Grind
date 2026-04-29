package com.grind.backend.auth;

import com.grind.backend.user.UserDto;
import com.grind.backend.user.UserModel;
import com.grind.backend.user.UserRepository;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TokenService tokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String normalizedUsername = request.username().trim();

        UserModel user = userRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = tokenService.generateToken(user);

        return new LoginResponse(
                token,
                UserDto.fromModel(user)
        );
    }
}