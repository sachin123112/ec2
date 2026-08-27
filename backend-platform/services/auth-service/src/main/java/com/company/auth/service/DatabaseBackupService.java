package com.company.auth.service;

import com.company.auth.model.ActivityLog;
import com.company.auth.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class DatabaseBackupService {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseBackupService.class);
    private static final DateTimeFormatter FILE_TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final String pgDumpPath;
    private final Path backupDirectory;
    private final String databaseUrl;
    private final String databaseUsername;
    private final String databasePassword;
    private final ActivityLogRepository activityLogRepository;

    public DatabaseBackupService(
            @Value("${backup.pg-dump-path:pg_dump}") String pgDumpPath,
            @Value("${backup.directory:backups}") String backupDirectory,
            @Value("${spring.datasource.url}") String databaseUrl,
            @Value("${spring.datasource.username}") String databaseUsername,
            @Value("${spring.datasource.password}") String databasePassword,
            ActivityLogRepository activityLogRepository) {
        this.pgDumpPath = pgDumpPath;
        this.backupDirectory = Paths.get(backupDirectory);
        this.databaseUrl = databaseUrl;
        this.databaseUsername = databaseUsername;
        this.databasePassword = databasePassword;
        this.activityLogRepository = activityLogRepository;
    }

    public BackupResult createDatabaseBackup() {
        try {
            Files.createDirectories(backupDirectory);
            String fileName = "database-" + FILE_TIMESTAMP.format(LocalDateTime.now()) + ".dump";
            Path output = backupDirectory.resolve(fileName).toAbsolutePath();
                URI databaseUri = URI.create(databaseUrl.substring("jdbc:".length()));
                String host = databaseUri.getHost();
                String port = databaseUri.getPort() > 0 ? String.valueOf(databaseUri.getPort()) : "5432";
            String database = databaseUrl.substring(databaseUrl.lastIndexOf('/') + 1).split("\\?", 2)[0];

            List<String> command = new ArrayList<>(List.of(
                    pgDumpPath, "--format=custom", "--file", output.toString(),
                    "--host", host, "--port", port, "--username", databaseUsername, database));
            int exitCode;
            String outputText;
            try {
                ProcessResult result = runProcess(command, output, false);
                exitCode = result.exitCode();
                outputText = result.output();
            } catch (IOException missingPgDump) {
                List<String> dockerCommand = List.of(
                        "docker", "exec", "-e", "PGPASSWORD=" + databasePassword,
                        "postgres", "pg_dump", "--format=custom", "--host", "localhost",
                        "--port", port, "--username", databaseUsername, database);
                ProcessResult result;
                try {
                    result = runProcess(dockerCommand, output, true);
                } catch (IOException dockerUnavailable) {
                    throw new IllegalStateException(
                            "pg_dump is not installed and Docker Desktop is unavailable. "
                                    + "Install PostgreSQL client tools or start Docker Desktop with the postgres container.",
                            dockerUnavailable);
                }
                exitCode = result.exitCode();
                outputText = result.output();
            }
            if (exitCode != 0) {
                Files.deleteIfExists(output);
                throw new IllegalStateException(outputText.trim());
            }
            long size = Files.size(output);
            ActivityLog log = new ActivityLog();
            log.setType("Backup");
            log.setMessage("Full database backup created: " + fileName);
            log.setSource("backup-service");
            activityLogRepository.save(log);
            return new BackupResult(fileName, size);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to create database backup: " + exception.getMessage(), exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Database backup was interrupted.", exception);
        }
    }

    private ProcessResult runProcess(List<String> command, Path output, boolean writeOutputToFile)
            throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder(command).redirectErrorStream(true);
        processBuilder.environment().put("PGPASSWORD", databasePassword);
        if (writeOutputToFile) {
            processBuilder.redirectOutput(output.toFile());
        }
        Process process = processBuilder.start();
        String processOutput = writeOutputToFile
                ? ""
                : new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();
        return new ProcessResult(exitCode, processOutput);
    }

    public Path getBackupPath(String fileName) {
        Path directory = backupDirectory.toAbsolutePath().normalize();
        Path requested = directory.resolve(fileName).normalize();
        if (!requested.getParent().equals(directory)
                || !Files.isRegularFile(requested)) {
            throw new IllegalArgumentException("Backup file not found.");
        }
        return requested;
    }

    @Scheduled(cron = "${backup.cron:0 0 2 * * *}")
    public void createScheduledDatabaseBackup() {
        try {
            BackupResult result = createDatabaseBackup();
            logger.info("Scheduled database backup created: {} ({} bytes)", result.fileName(), result.size());
        } catch (RuntimeException exception) {
            logger.error("Scheduled database backup failed", exception);
        }
    }

    public record BackupResult(String fileName, long size) { }
    private record ProcessResult(int exitCode, String output) { }
}