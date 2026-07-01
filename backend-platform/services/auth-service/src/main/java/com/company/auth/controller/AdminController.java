package com.company.auth.controller;

import com.company.auth.dto.OrderDto;
import com.company.auth.dto.UserDto;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.UserRepository;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.User;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
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
    public Map<String, Object> dashboard() {
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal revenue = orderRepository.findAll().stream()
                .map(OrderEntity::getTotalAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalUsers", totalUsers);
        resp.put("totalOrders", totalOrders);
        resp.put("revenue", revenue);
        return resp;
    }

    @GetMapping("/analytics/orders")
    public Map<String, Object> ordersAnalytics() {
        long totalOrders = orderRepository.count();
        Map<String, Long> byStatus = orderRepository.findAll().stream()
                .map(OrderEntity::getStatus)
                .collect(Collectors.groupingBy(s -> s == null ? "UNKNOWN" : s, Collectors.counting()));

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalOrders", totalOrders);
        resp.put("byStatus", byStatus);
        return resp;
    }

    @GetMapping("/analytics/revenue")
    public Map<String, Object> revenueAnalytics() {
        BigDecimal revenue = orderRepository.findAll().stream()
                .map(OrderEntity::getTotalAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalRevenue", revenue);
        return resp;
    }

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
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
