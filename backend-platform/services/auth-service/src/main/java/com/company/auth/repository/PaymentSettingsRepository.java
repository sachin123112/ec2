package com.company.auth.repository;

import com.company.auth.model.PaymentSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentSettingsRepository extends JpaRepository<PaymentSettings, Long> {
}