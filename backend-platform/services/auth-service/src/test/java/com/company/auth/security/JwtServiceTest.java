package com.company.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "thisIsA32ByteSecretKeyForTest123");
        ReflectionTestUtils.setField(jwtService, "expiration", 60000L);
    }

    @Test
    void generateToken_extractsUsernameAndRoles() {
        String token = jwtService.generateToken("alice", List.of("USER", "ADMIN"));

        assertEquals("alice", jwtService.extractUsername(token));
        assertEquals(List.of("USER", "ADMIN"), jwtService.extractRoles(token));
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void expiredToken_isRejected() {
        ReflectionTestUtils.setField(jwtService, "expiration", 0L);

        String token = jwtService.generateToken("bob", List.of("USER"));

        assertFalse(jwtService.isTokenValid(token));
    }

    @Test
    void invalidToken_isRejected() {
        assertFalse(jwtService.isTokenValid("not-a-valid-jwt"));
    }

    @Test
    void blankSecret_fallsBackToDefaultKey() {
        ReflectionTestUtils.setField(jwtService, "secret", "");

        assertDoesNotThrow(() -> jwtService.generateToken("charlie", List.of("ADMIN")));
        assertTrue(jwtService.isTokenValid(jwtService.generateToken("charlie", List.of("ADMIN"))));
    }
}
