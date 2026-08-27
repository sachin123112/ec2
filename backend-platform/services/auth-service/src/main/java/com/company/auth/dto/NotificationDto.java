package com.company.auth.dto;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime timestamp;

    public NotificationDto() {
    }

    public NotificationDto(Long id, String title, String message, String type, boolean read, LocalDateTime timestamp) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = read;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public boolean isRead() { return read; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
