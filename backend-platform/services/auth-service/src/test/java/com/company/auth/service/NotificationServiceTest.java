package com.company.auth.service;

import com.company.auth.model.Notification;
import com.company.auth.model.User;
import com.company.auth.repository.NotificationRepository;
import com.company.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void shouldCreateNotificationsForAllUsers() {
        User admin = new User();
        admin.setId(1L);
        admin.setEmail("admin@example.com");

        User member = new User();
        member.setId(2L);
        member.setEmail("user@example.com");

        when(userRepository.findAll()).thenReturn(List.of(admin, member));

        notificationService.notifyAllUsers(
                "New product added",
                "A new pet product is now available in the shop.",
                "product"
        );

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> notifications = captor.getValue();
        assertEquals(2, notifications.size());
        assertTrue(notifications.stream().allMatch(n -> "product".equals(n.getType())));
        assertEquals(Set.of(1L, 2L), notifications.stream().map(n -> n.getUser().getId()).collect(Collectors.toSet()));
        assertTrue(notifications.stream().allMatch(n -> n.getTitle().equals("New product added")));
    }
}
