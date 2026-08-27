package com.company.auth.controller;

import com.company.auth.model.ActivityLog;
import com.company.auth.repository.ActivityLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/logs")
public class ActivityLogController {
    private final ActivityLogRepository repository;

    public ActivityLogController(ActivityLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ActivityLog> getLogs() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearLogs() {
        repository.deleteAllInBatch();
        return ResponseEntity.ok(Map.of("message", "Activity logs cleared successfully."));
    }
}