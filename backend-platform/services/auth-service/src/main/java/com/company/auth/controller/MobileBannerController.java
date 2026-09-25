package com.company.auth.controller;

import com.company.auth.dto.MobileBannerDto;
import com.company.auth.model.MobileBanner;
import com.company.auth.repository.MobileBannerRepository;
import com.company.auth.service.ImageKitImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/banners")
public class MobileBannerController {
    private static final Set<String> PAGE_KEYS = Set.of("HOME", "SHOP", "BRANDS", "OFFERS", "CART", "WALLET", "PRODUCTS", "WISHLIST");
    private final MobileBannerRepository repository;
    private final ImageKitImageService imageService;

    public MobileBannerController(MobileBannerRepository repository, ImageKitImageService imageService) {
        this.repository = repository;
        this.imageService = imageService;
    }

    @GetMapping
    public List<MobileBannerDto> list(@RequestParam(required = false) String page) {
        if (page == null || page.isBlank()) {
            return repository.findAllByOrderByPageKeyAscCreatedAtDescIdDesc().stream().map(this::toDto).collect(Collectors.toList());
        }
        return repository.findByPageKeyOrderByCreatedAtDescIdDesc(normalizePage(page)).stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public MobileBannerDto upload(@RequestParam String page, @RequestPart("image") MultipartFile image) {
        String pageKey = normalizePage(page);
        if (image == null || image.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Banner image is required");
        if (image.getSize() > 5 * 1024 * 1024) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image size must be less than 5MB");
        String contentType = image.getContentType();
        if (!Set.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG, and WebP images are supported");
        }
        MobileBanner banner = new MobileBanner();
        banner.setPageKey(pageKey);
        banner.setImageUrl(imageService.uploadMobileBanner(image, pageKey));
        return toDto(repository.save(banner));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Banner not found");
        repository.deleteById(id);
    }

    private String normalizePage(String page) {
        String normalized = page.trim().toUpperCase();
        if (!PAGE_KEYS.contains(normalized)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported mobile banner page");
        return normalized;
    }

    private MobileBannerDto toDto(MobileBanner banner) {
        MobileBannerDto dto = new MobileBannerDto();
        dto.setId(banner.getId());
        dto.setPageKey(banner.getPageKey());
        dto.setImageUrl(banner.getImageUrl());
        return dto;
    }
}