package com.company.auth.dto;

public record LoginRequest(
        String email,
        String password) {
}
