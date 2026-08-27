package com.company.auth.controller;

import com.company.auth.dto.SecuritySettingsDto;
import com.company.auth.model.SecuritySettings;
import com.company.auth.repository.SecuritySettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/security-settings")
public class SecuritySettingsController {
    private final SecuritySettingsRepository repository;

    public SecuritySettingsController(SecuritySettingsRepository repository) { this.repository = repository; }

    @GetMapping
    public SecuritySettingsDto get() {
        return toDto(repository.findById(1L).orElseGet(() -> repository.save(new SecuritySettings())));
    }

    @PutMapping
    public ResponseEntity<SecuritySettingsDto> update(@RequestBody SecuritySettingsDto request) {
        SecuritySettings settings = repository.findById(1L).orElseGet(SecuritySettings::new);
        settings.setTwoFactorAuth(request.isTwoFactorAuth());
        settings.setPasswordPolicy(request.isPasswordPolicy());
        settings.setMinimumPasswordLength(request.getMinimumPasswordLength());
        settings.setSessionTimeout(request.getSessionTimeout());
        settings.setLoginAttempts(request.getLoginAttempts());
        settings.setIpWhitelist(request.isIpWhitelist());
        return ResponseEntity.ok(toDto(repository.save(settings)));
    }

    private SecuritySettingsDto toDto(SecuritySettings settings) {
        SecuritySettingsDto dto = new SecuritySettingsDto();
        dto.setTwoFactorAuth(settings.isTwoFactorAuth());
        dto.setPasswordPolicy(settings.isPasswordPolicy());
        dto.setMinimumPasswordLength(settings.getMinimumPasswordLength());
        dto.setSessionTimeout(settings.getSessionTimeout());
        dto.setLoginAttempts(settings.getLoginAttempts());
        dto.setIpWhitelist(settings.isIpWhitelist());
        return dto;
    }
}