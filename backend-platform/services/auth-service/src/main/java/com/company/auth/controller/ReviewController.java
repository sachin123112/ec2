package com.company.auth.controller;

import com.company.auth.model.Review;
import com.company.auth.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class ReviewController {
    private static final List<String> ALLOWED_STATUSES = List.of("PUBLISHED", "PENDING", "FLAGGED");
    private final ReviewRepository repository;

    public ReviewController(ReviewRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ReviewResponse> getReviews() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(ReviewResponse::from).toList();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status must be PUBLISHED, PENDING, or FLAGGED."));
        }

        Review review = repository.findById(id).orElse(null);
        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Review not found."));
        }

        review.setStatus(normalizedStatus);
        return ResponseEntity.ok(ReviewResponse.from(repository.save(review)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Review not found."));
        }
        repository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully."));
    }

    public record ReviewResponse(
        Long id,
        String customer,
        String product,
        Integer rating,
        String review,
        String date,
        String status,
        String avatar
    ) {
        static ReviewResponse from(Review review) {
            String customerName = review.getCustomerName();
            return new ReviewResponse(
                review.getId(),
                customerName,
                review.getProductName(),
                review.getRating(),
                review.getReviewText(),
                review.getCreatedAt() == null ? "" : review.getCreatedAt().toLocalDate().toString(),
                titleCase(review.getStatus()),
                customerName == null || customerName.isBlank() ? "?" : customerName.substring(0, 1).toUpperCase()
            );
        }

        private static String titleCase(String value) {
            if (value == null || value.isBlank()) return "Pending";
            return value.substring(0, 1).toUpperCase() + value.substring(1).toLowerCase();
        }
    }
}
