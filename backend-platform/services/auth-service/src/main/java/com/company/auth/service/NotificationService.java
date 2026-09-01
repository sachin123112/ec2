package com.company.auth.service;

import com.company.auth.model.Notification;
import com.company.auth.model.User;
import com.company.auth.repository.NotificationRepository;
import com.company.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyAllUsers(String title, String message, String type) {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return;
        }

        List<Notification> notifications = new ArrayList<>();
        for (User user : users) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setRead(false);
            notifications.add(notification);
        }

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void notifyUserAndAdmins(User user, String title, String message, String type) {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return;
        }

        List<Notification> notifications = new ArrayList<>();
        for (User recipient : users) {
            boolean isAdmin = recipient.getRoles() != null && recipient.getRoles().stream()
                    .anyMatch(role -> "ADMIN".equalsIgnoreCase(role.getName()) || "ROLE_ADMIN".equalsIgnoreCase(role.getName()));
            boolean isTarget = recipient.getId() != null && recipient.getId().equals(user.getId());
            if (!isAdmin && !isTarget) continue;

            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setRead(false);
            notifications.add(notification);
        }

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }
}
