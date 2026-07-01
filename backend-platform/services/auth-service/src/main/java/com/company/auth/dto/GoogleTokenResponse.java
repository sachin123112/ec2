package com.company.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GoogleTokenResponse {
    private String accessToken;
    private String expiresIn;
    private String scope;
    private String tokenType;
    private String idToken;

    public GoogleTokenResponse() {
    }

    @JsonProperty("access_token")
    public String getAccessToken() {
        return accessToken;
    }

    @JsonProperty("access_token")
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    @JsonProperty("expires_in")
    public String getExpiresIn() {
        return expiresIn;
    }

    @JsonProperty("expires_in")
    public void setExpiresIn(String expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    @JsonProperty("token_type")
    public String getTokenType() {
        return tokenType;
    }

    @JsonProperty("token_type")
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    @JsonProperty("id_token")
    public String getIdToken() {
        return idToken;
    }

    @JsonProperty("id_token")
    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
