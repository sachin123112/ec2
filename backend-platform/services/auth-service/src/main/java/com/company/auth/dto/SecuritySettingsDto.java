package com.company.auth.dto;

public class SecuritySettingsDto {
    private boolean twoFactorAuth;
    private boolean passwordPolicy;
    private String minimumPasswordLength;
    private String sessionTimeout;
    private String loginAttempts;
    private boolean ipWhitelist;

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