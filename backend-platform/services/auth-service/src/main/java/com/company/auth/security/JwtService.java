package com.company.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private static final String FALLBACK_SECRET = "dev-secret-32-byte-key-1234567890";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private String resolveSecret() {
        String resolved = secret == null ? FALLBACK_SECRET : secret.trim();
        return resolved.isEmpty() ? FALLBACK_SECRET : resolved;
    }

    public String generateToken(String username, List<String> roles) {
        Date now = new Date();

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiration))
                .signWith(Keys.hmacShaKeyFor(resolveSecret().getBytes(StandardCharsets.UTF_8)), Jwts.SIG.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        Jws<Claims> claimsJws = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(resolveSecret().getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token);
        return claimsJws.getPayload();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        Object rolesObject = extractAllClaims(token).get("roles");
        if (rolesObject instanceof List<?>) {
            return ((List<?>) rolesObject).stream()
                    .map(o -> String.valueOf(o))
                    .toList();
        }
        return List.of();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration() != null && claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
