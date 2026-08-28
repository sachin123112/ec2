package com.company.auth.controller;

import com.company.auth.dto.UserDto;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.UserRepository;
import com.company.auth.model.User;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminController(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/dashboard")
        @Operation(summary = "Dashboard summary", description = "Totals for users, orders and revenue")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dashboard summary",
                content = @Content(schema = @Schema(implementation = java.util.Map.class)))
        })
        public Map<String, Object> dashboard() {
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal revenue = orderRepository.sumTotalAmount();

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalUsers", totalUsers);
        resp.put("totalOrders", totalOrders);
        resp.put("revenue", revenue);
        return resp;
    }

    @GetMapping("/analytics/orders")
    @Operation(summary = "Orders analytics", description = "Order counts grouped by status")
    public Map<String, Object> ordersAnalytics() {
        long totalOrders = orderRepository.count();
        Map<String, Long> byStatus = orderRepository.countByStatus().stream()
            .collect(Collectors.toMap(row -> row[0] == null ? "UNKNOWN" : (String) row[0],
                row -> ((Number) row[1]).longValue()));

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalOrders", totalOrders);
        resp.put("byStatus", byStatus);
        return resp;
    }

    @GetMapping("/analytics/revenue")
    @Operation(summary = "Revenue analytics", description = "Total revenue")
    public Map<String, Object> revenueAnalytics() {
        BigDecimal revenue = orderRepository.sumTotalAmount();

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalRevenue", revenue);
        return resp;
    }

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userRepository.findTop500ByOrderByCreatedAtDescIdDesc().stream()
            .map(user -> toDto(user)).collect(Collectors.toList());
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setCountryCode(user.getCountryCode());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setGender(user.getGender());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()));
        return dto;
    }
}
