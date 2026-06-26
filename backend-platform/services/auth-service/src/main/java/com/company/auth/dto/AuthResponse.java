package com.company.auth.dto;

import java.util.List;

public class AuthResponse {
    private String accessToken;
    private List<String> roles;

    public AuthResponse() {}

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public AuthResponse(String accessToken, List<String> roles) {
        this.accessToken = accessToken;
        this.roles = roles;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}

