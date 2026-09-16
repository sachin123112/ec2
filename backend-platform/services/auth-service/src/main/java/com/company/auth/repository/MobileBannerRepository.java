package com.company.auth.repository;

import com.company.auth.model.MobileBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MobileBannerRepository extends JpaRepository<MobileBanner, Long> {
    List<MobileBanner> findByPageKeyOrderByCreatedAtDescIdDesc(String pageKey);
    List<MobileBanner> findAllByOrderByPageKeyAscCreatedAtDescIdDesc();
}