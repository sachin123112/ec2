package com.company.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "brands")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(name = "logo_url", length = 2048)
    private String logoUrl;

    @Column(length = 24, nullable = false)
    private String tone = "blue";

    @Column(length = 24, nullable = false)
    private String status = "ACTIVE";

    @Column(name = "product_count", nullable = false)
    private Integer productCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (tone == null || tone.isBlank()) tone = "blue";
        if (status == null || status.isBlank()) status = "ACTIVE";
        if (productCount == null) productCount = 0;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getProductCount() { return productCount; }
    public void setProductCount(Integer productCount) { this.productCount = productCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
