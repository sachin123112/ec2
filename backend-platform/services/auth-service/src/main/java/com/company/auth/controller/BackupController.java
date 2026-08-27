package com.company.auth.controller;

import com.company.auth.service.DatabaseBackupService;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/backups")
public class BackupController {
    private final DatabaseBackupService databaseBackupService;

    public BackupController(DatabaseBackupService databaseBackupService) {
        this.databaseBackupService = databaseBackupService;
    }

    @PostMapping("/database")
    public ResponseEntity<Map<String, Object>> createDatabaseBackup() {
        DatabaseBackupService.BackupResult result = databaseBackupService.createDatabaseBackup();
        return ResponseEntity.ok(Map.of(
                "fileName", result.fileName(),
                "size", result.size(),
                "message", "Database backup created successfully."));
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadDatabaseBackup(@PathVariable String fileName) {
        FileSystemResource resource = new FileSystemResource(databaseBackupService.getBackupPath(fileName));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}