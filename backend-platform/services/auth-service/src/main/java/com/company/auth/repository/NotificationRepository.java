package com.company.auth.repository;

import com.company.auth.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByUserIdOrderByTimestampDesc(Long userId);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    void deleteAllByUserId(Long userId);
}
