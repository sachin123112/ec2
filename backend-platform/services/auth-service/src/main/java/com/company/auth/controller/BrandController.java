package com.company.auth.controller;

import com.company.auth.model.Brand;
import com.company.auth.repository.BrandRepository;
import com.company.auth.service.ImageKitImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin/brands")
public class BrandController {
    private static final long MAX_LOGO_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/svg+xml"
    );

    private final BrandRepository repository;
    private final ImageKitImageService imageService;

    public BrandController(BrandRepository repository, ImageKitImageService imageService) {
        this.repository = repository;
        this.imageService = imageService;
    }

    @GetMapping
    public List<BrandResponse> list() {
        return repository.findAllByOrderByCreatedAtDescIdDesc().stream().map(BrandResponse::from).toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandResponse> create(
            @RequestParam String name,
            @RequestParam(defaultValue = "blue") String tone,
            @RequestParam(defaultValue = "ACTIVE") String status,
            @RequestParam(defaultValue = "0") Integer productCount,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        String normalizedName = name == null ? "" : name.trim();
        if (normalizedName.isBlank()) throw badRequest("Brand name is required.");
        if (productCount == null || productCount < 0) throw badRequest("Product count cannot be negative.");

        String normalizedStatus = normalizeStatus(status);
        if (repository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .anyMatch(brand -> brand.getName().equalsIgnoreCase(normalizedName))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A brand with this name already exists.");
        }

        validateLogo(logo);
        Brand brand = new Brand();
        brand.setName(normalizedName);
        brand.setTone(tone == null || tone.isBlank() ? "blue" : tone.trim().toLowerCase());
        brand.setStatus(normalizedStatus);
        brand.setProductCount(productCount);
        Brand saved = repository.save(brand);

        if (logo != null && !logo.isEmpty()) {
            saved.setLogoUrl(imageService.uploadBrandLogo(logo, saved.getId()));
            saved = repository.save(saved);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(BrandResponse.from(saved));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public BrandResponse updateStatus(@PathVariable Long id, @RequestParam String status) {
        Brand brand = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found."));
        brand.setStatus(normalizeStatus(status));
        return BrandResponse.from(repository.save(brand));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found.");
        repository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Brand deleted successfully."));
    }

    private void validateLogo(MultipartFile logo) {
        if (logo == null || logo.isEmpty()) return;
        if (logo.getSize() > MAX_LOGO_SIZE) throw badRequest("Brand logo must be smaller than 5MB.");
        if (!ALLOWED_IMAGE_TYPES.contains(logo.getContentType())) {
            throw badRequest("Only JPEG, PNG, WebP, and SVG brand logos are supported.");
        }
    }

    private String normalizeStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!Set.of("ACTIVE", "INACTIVE").contains(normalized)) throw badRequest("Status must be ACTIVE or INACTIVE.");
        return normalized;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public record BrandResponse(Long id, String name, String logo, String tone, String status, Integer productCount, String createdAt) {
        static BrandResponse from(Brand brand) {
            return new BrandResponse(
                brand.getId(), brand.getName(), brand.getLogoUrl(), brand.getTone(), titleCase(brand.getStatus()),
                brand.getProductCount(), brand.getCreatedAt() == null ? "" : brand.getCreatedAt().toLocalDate().toString()
            );
        }

        private static String titleCase(String value) {
            if (value == null || value.isBlank()) return "Active";
            return value.substring(0, 1).toUpperCase() + value.substring(1).toLowerCase();
        }
    }
}
