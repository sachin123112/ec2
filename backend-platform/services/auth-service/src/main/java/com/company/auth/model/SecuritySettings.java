package com.company.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "security_settings")
public class SecuritySettings {
    @Id
    private Long id = 1L;
    private boolean twoFactorAuth = true;
    private boolean passwordPolicy = true;
    private String minimumPasswordLength = "8 Characters";
    private String sessionTimeout = "30 Minutes";
    private String loginAttempts = "5 Attempts";
    private boolean ipWhitelist;

    public Long getId() { return id; }
    public boolean isTwoFactorAuth() { return twoFactorAuth; }
    public void setTwoFactorAuth(boolean value) { twoFactorAuth = value; }
    public boolean isPasswordPolicy() { return passwordPolicy; }
    public void setPasswordPolicy(boolean value) { passwordPolicy = value; }
    public String getMinimumPasswordLength() { return minimumPasswordLength; }
    public void setMinimumPasswordLength(String value) { minimumPasswordLength = value; }
    public String getSessionTimeout() { return sessionTimeout; }
    public void setSessionTimeout(String value) { sessionTimeout = value; }
    public String getLoginAttempts() { return loginAttempts; }
    public void setLoginAttempts(String value) { loginAttempts = value; }
    public boolean isIpWhitelist() { return ipWhitelist; }
    public void setIpWhitelist(boolean value) { ipWhitelist = value; }
}