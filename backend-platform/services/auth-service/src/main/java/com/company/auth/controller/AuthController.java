package com.company.auth.controller;

import com.company.auth.dto.AuthResponse;
import com.company.auth.dto.LoginRequest;
import com.company.auth.model.User;
import com.company.auth.repository.UserRepository;
import com.company.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
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

        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
