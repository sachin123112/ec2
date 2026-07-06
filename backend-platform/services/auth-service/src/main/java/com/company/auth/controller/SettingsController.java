package com.company.auth.controller;

import com.company.auth.model.SystemSetting;
import com.company.auth.repository.SystemSettingRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/admin")
public class SettingsController {

    private static final Logger logger = LoggerFactory.getLogger(SettingsController.class);

    private final SystemSettingRepository systemSettingRepository;
    private final ObjectMapper objectMapper;

    public SettingsController(SystemSettingRepository systemSettingRepository, ObjectMapper objectMapper) {
        this.systemSettingRepository = systemSettingRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        try {
            SystemSetting systemSetting = systemSettingRepository.findTopByOrderByIdAsc()
                    .orElse(new SystemSetting());
            Map<String, Object> settings = objectMapper.readValue(
                    systemSetting.getSettingsJson(), new TypeReference<>() {});
            return ResponseEntity.ok(settings);
        } catch (Exception ex) {
            logger.error("Unable to load system settings", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> settings) {
        try {
            SystemSetting systemSetting = systemSettingRepository.findTopByOrderByIdAsc()
                    .orElse(new SystemSetting());
            systemSetting.setSettingsJson(objectMapper.writeValueAsString(settings));
            systemSettingRepository.save(systemSetting);
            return ResponseEntity.ok(settings);
        } catch (Exception ex) {
            logger.error("Unable to save system settings", ex);
            return ResponseEntity.internalServerError().build();
        }
    }
}
