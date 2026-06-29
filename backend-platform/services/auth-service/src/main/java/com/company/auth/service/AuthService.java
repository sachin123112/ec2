package com.company.auth.service;

import com.company.auth.dto.AuthResponse;
import com.company.auth.dto.LoginRequest;
import com.company.auth.model.RefreshToken;
import com.company.auth.model.Role;
import com.company.auth.model.User;
import com.company.auth.repository.RefreshTokenRepository;
import com.company.auth.repository.RoleRepository;
import com.company.auth.repository.UserRepository;
import com.company.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       RoleRepository roleRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        String storedHash = user.getPasswordHash();
        boolean matches = storedHash != null && (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$"))
                ? passwordEncoder.matches(request.getPassword(), storedHash)
                : request.getPassword().equals(storedHash);

        if (!matches) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        ensureUserHasRoles(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required.");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token."));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.deleteByToken(refreshTokenValue);
            throw new IllegalArgumentException("Refresh token expired.");
        }

        User user = refreshToken.getUser();
        ensureUserHasRoles(user);
        return buildAuthResponse(user);
    }

    private User ensureUserHasRoles(User user) {
        if (user.getRoles().isEmpty()) {
            String fallbackRoleName = user.getEmail().equalsIgnoreCase("admin@pawmart.com") ? "ADMIN" : "USER";
            Role fallbackRole = roleRepository.findByName(fallbackRoleName).orElseGet(() -> {
                Role newRole = new Role();
                newRole.setName(fallbackRoleName);
                newRole.setDescription(fallbackRoleName.equals("ADMIN") ? "Administrator with full access" : "Default user role");
                return roleRepository.save(newRole);
            });
            user.getRoles().add(fallbackRole);
            userRepository.save(user);
        }
        return user;
    }

    private AuthResponse buildAuthResponse(User user) {
        refreshTokenRepository.deleteAllByUserId(user.getId());
        var roles = user.getRoles().stream().map(Role::getName).toList();
        String token = jwtService.generateToken(user.getEmail(), roles);
        RefreshToken refreshToken = createRefreshToken(user);
        return new AuthResponse(token, roles, refreshToken.getToken());
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString().replaceAll("-", ""));
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        return refreshTokenRepository.save(refreshToken);
    }
}
