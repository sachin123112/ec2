package com.company.auth.controller;

import com.company.auth.dto.PaymentSettingsDto;
import com.company.auth.model.PaymentSettings;
import com.company.auth.repository.PaymentSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment-settings")
public class PaymentSettingsController {
    private final PaymentSettingsRepository repository;

    public PaymentSettingsController(PaymentSettingsRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public PaymentSettingsDto get() {
        return toDto(repository.findById(1L).orElseGet(() -> repository.save(new PaymentSettings())));
    }

    @PutMapping
    public ResponseEntity<PaymentSettingsDto> update(@RequestBody PaymentSettingsDto request) {
        PaymentSettings settings = repository.findById(1L).orElseGet(PaymentSettings::new);
        settings.setRazorpayKeyId(request.getRazorpayKeyId());
        if (request.getRazorpayKeySecret() != null && !request.getRazorpayKeySecret().isBlank()) {
            settings.setRazorpayKeySecret(request.getRazorpayKeySecret());
        }
        settings.setStripeActive(request.isStripeActive());
        settings.setPaypalActive(request.isPaypalActive());
        settings.setCashOnDeliveryActive(request.isCashOnDeliveryActive());
        settings.setUpiActive(request.isUpiActive());
        settings.setUpiId(request.getUpiId());
        settings.setFreeShippingThreshold(request.getFreeShippingThreshold());
        settings.setShippingFee(request.getShippingFee());
        return ResponseEntity.ok(toDto(repository.save(settings)));
    }

    private PaymentSettingsDto toDto(PaymentSettings settings) {
        PaymentSettingsDto dto = new PaymentSettingsDto();
        dto.setRazorpayKeyId(settings.getRazorpayKeyId());
        dto.setStripeActive(settings.isStripeActive());
        dto.setPaypalActive(settings.isPaypalActive());
        dto.setCashOnDeliveryActive(settings.isCashOnDeliveryActive());
        dto.setUpiActive(settings.isUpiActive());
        dto.setUpiId(settings.getUpiId());
        dto.setFreeShippingThreshold(settings.getFreeShippingThreshold());
        dto.setShippingFee(settings.getShippingFee());
        return dto;
    }
}