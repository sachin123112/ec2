package com.company.auth.controller;

import com.company.auth.dto.NotificationSettingsDto;
import com.company.auth.model.NotificationSettings;
import com.company.auth.repository.NotificationSettingsRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/notification-settings")
public class NotificationSettingsController {
    private final NotificationSettingsRepository repository;

    public NotificationSettingsController(NotificationSettingsRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public NotificationSettingsDto get() {
        return toDto(repository.findById(1L).orElseGet(() -> repository.save(new NotificationSettings())));
    }

    @PutMapping
    public NotificationSettingsDto update(@RequestBody NotificationSettingsDto request) {
        NotificationSettings settings = repository.findById(1L).orElseGet(NotificationSettings::new);
        settings.setNewOrderNotifications(request.isNewOrderNotifications());
        settings.setLowStockAlerts(request.isLowStockAlerts());
        settings.setCustomerReviews(request.isCustomerReviews());
        settings.setOrderStatusUpdates(request.isOrderStatusUpdates());
        settings.setDailySummary(request.isDailySummary());
        settings.setMarketingUpdates(request.isMarketingUpdates());
        return toDto(repository.save(settings));
    }

    private NotificationSettingsDto toDto(NotificationSettings settings) {
        NotificationSettingsDto dto = new NotificationSettingsDto();
        dto.setNewOrderNotifications(settings.isNewOrderNotifications());
        dto.setLowStockAlerts(settings.isLowStockAlerts());
        dto.setCustomerReviews(settings.isCustomerReviews());
        dto.setOrderStatusUpdates(settings.isOrderStatusUpdates());
        dto.setDailySummary(settings.isDailySummary());
        dto.setMarketingUpdates(settings.isMarketingUpdates());
        return dto;
    }
}
