package com.company.auth.repository;

import com.company.auth.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findAllByOrderByCreatedAtDescIdDesc();
}
