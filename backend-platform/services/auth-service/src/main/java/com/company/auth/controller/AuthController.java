package com.company.auth.controller;

import com.company.auth.dto.AuthResponse;
import com.company.auth.dto.LoginRequest;
import com.company.auth.dto.RefreshTokenRequest;
import com.company.auth.model.RefreshToken;
import com.company.auth.model.Role;
import com.company.auth.model.User;
import com.company.auth.repository.PasswordResetTokenRepository;
import com.company.auth.repository.RefreshTokenRepository;
import com.company.auth.repository.RoleRepository;
import com.company.auth.repository.UserRepository;
import com.company.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            RefreshTokenRepository refreshTokenRepository,
            RoleRepository roleRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        User user = optionalUser.get();
        String storedHash = user.getPasswordHash();

        boolean matches;
        if (storedHash != null && (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$"))) {
            matches = passwordEncoder.matches(request.getPassword(), storedHash);
        } else {
            matches = request.getPassword().equals(storedHash);
        }

        if (!matches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        ensureUserHasRoles(user);
        AuthResponse authResponse = buildAuthResponse(user);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody com.company.auth.dto.CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername() == null ? request.getEmail() : request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setStatus("ACTIVE");

        user = ensureUserHasRoles(user);
        user = userRepository.save(user);

        AuthResponse authResponse = buildAuthResponse(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody com.company.auth.dto.ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = UUID.randomUUID().toString().replaceAll("-", "");
            com.company.auth.model.PasswordResetToken resetToken = new com.company.auth.model.PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
            passwordResetTokenRepository.save(resetToken);
            System.out.println("Password reset token for " + request.getEmail() + ": " + token);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody com.company.auth.dto.ResetPasswordRequest request) {
        Optional<com.company.auth.model.PasswordResetToken> resetTokenOptional = passwordResetTokenRepository.findByToken(request.getToken());
        if (resetTokenOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid reset token.");
        }

        com.company.auth.model.PasswordResetToken resetToken = resetTokenOptional.get();
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.deleteByToken(request.getToken());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reset token expired.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        ensureUserHasRoles(user);
        userRepository.save(user);
        passwordResetTokenRepository.deleteByToken(request.getToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return ResponseEntity.badRequest().body("Refresh token is required.");
        }

        Optional<RefreshToken> refreshTokenOptional = refreshTokenRepository.findByToken(request.getRefreshToken());
        if (refreshTokenOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token.");
        }

        RefreshToken refreshToken = refreshTokenOptional.get();
        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.deleteByToken(request.getRefreshToken());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token expired.");
        }

        User user = refreshToken.getUser();
        ensureUserHasRoles(user);
        AuthResponse authResponse = buildAuthResponse(user);
        return ResponseEntity.ok(authResponse);
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
        refreshTokenRepository.deleteAllByUser(user);
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
