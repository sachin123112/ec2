package com.company.auth.controller;

import com.company.auth.dto.AuthResponse;
import com.company.auth.dto.GoogleUserInfo;
import com.company.auth.dto.GoogleTokenResponse;
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
import com.company.auth.service.AuthService;
import com.company.auth.service.GoogleOAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;
    private final PasswordEncoder passwordEncoder;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthController(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            RefreshTokenRepository refreshTokenRepository,
            RoleRepository roleRepository,
            JwtService jwtService,
            AuthService authService,
            GoogleOAuthService googleOAuthService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.authService = authService;
        this.googleOAuthService = googleOAuthService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse authResponse = authService.login(request);
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException ex) {
            logger.warn("Login failed for email={}: {}", request != null ? request.getEmail() : "null", ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        } catch (Exception ex) {
            logger.error("Unexpected login error for email={}", request != null ? request.getEmail() : "null", ex);
            throw ex;
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody com.company.auth.dto.CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername() == null ? request.getEmail().split("@")[0] : request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        if (request.getCountryCode() != null) {
            user.setCountryCode(request.getCountryCode());
        }
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
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
        try {
            AuthResponse authResponse = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @GetMapping("/google/url")
    public ResponseEntity<?> getGoogleAuthUrl(@RequestParam(required = false) String state) {
        String url = googleOAuthService.buildAuthorizationRedirectUrl(state);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestParam(required = false) String code,
                                                  @RequestParam(required = false) String state,
                                                  @RequestParam(required = false) String error) {
        if (error != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Google authentication failed: " + error);
        }
        if (code == null || code.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing authorization code from Google.");
        }

        GoogleTokenResponse tokenResponse = googleOAuthService.exchangeAuthorizationCode(code);
        GoogleUserInfo googleUser = googleOAuthService.fetchUserInfo(tokenResponse.getAccessToken());
        AuthResponse authResponse = authService.loginWithGoogle(googleUser);

        String frontendRedirect = String.format("%s/auth/google/callback?token=%s&refreshToken=%s&roles=%s&email=%s",
                frontendUrl,
                URLEncoder.encode(authResponse.getAccessToken(), StandardCharsets.UTF_8),
                URLEncoder.encode(authResponse.getRefreshToken(), StandardCharsets.UTF_8),
                URLEncoder.encode(String.join(",", authResponse.getRoles()), StandardCharsets.UTF_8),
                URLEncoder.encode(googleUser.getEmail(), StandardCharsets.UTF_8));

        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(frontendRedirect)).build();
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
