package com.company.auth.controller;

import com.company.auth.dto.NotificationDto;
import com.company.auth.model.Notification;
import com.company.auth.model.User;
import com.company.auth.repository.NotificationRepository;
import com.company.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<NotificationDto> list(Principal principal) {
        User user = currentUser(principal);
        return notificationRepository.findAllByUserIdOrderByTimestampDesc(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markAsRead(Principal principal, @PathVariable Long id) {
        Notification notification = ownedNotification(principal, id);
        notification.setRead(true);
        return toDto(notificationRepository.save(notification));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        notificationRepository.delete(ownedNotification(principal, id));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAll(Principal principal) {
        notificationRepository.deleteAllByUserId(currentUser(principal).getId());
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Unauthenticated request");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "User not found"));
    }

    private Notification ownedNotification(Principal principal, Long id) {
        User user = currentUser(principal);
        return notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Notification not found"));
    }

    private NotificationDto toDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getTimestamp());
    }
}
