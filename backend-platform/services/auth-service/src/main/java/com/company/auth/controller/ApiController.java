package com.company.auth.controller;

import com.company.auth.dto.AuthResponse;
import com.company.auth.dto.CreateOrderRequest;
import com.company.auth.dto.CreateProductRequest;
import com.company.auth.dto.CreateUserRequest;
import com.company.auth.dto.LoginRequest;
import com.company.auth.dto.OrderDto;
import com.company.auth.dto.ProductDto;
import com.company.auth.dto.UserDto;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.Product;
import com.company.auth.model.User;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.ProductRepository;
import com.company.auth.repository.UserRepository;
import com.company.auth.repository.CategoryRepository;
import com.company.auth.repository.RoleRepository;
import com.company.auth.dto.CategoryDto;
import com.company.auth.dto.RoleDto;
import com.company.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1")
public class ApiController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public ApiController(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            CategoryRepository categoryRepository,
            RoleRepository roleRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setStatus("ACTIVE");

        user = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(user));
    }

    @GetMapping("/products")
    public List<ProductDto> listProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(@RequestBody CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId()).ifPresent(product::setCategory);
        }

        product = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(product));
    }

    @GetMapping("/categories")
    public List<CategoryDto> listCategories() {
        return categoryRepository.findAll().stream().map(c -> {
            CategoryDto d = new CategoryDto();
            d.setId(c.getId()); d.setName(c.getName()); d.setCreatedAt(c.getCreatedAt()); return d;
        }).collect(Collectors.toList());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto request) {
        com.company.auth.model.Category c = new com.company.auth.model.Category();
        c.setName(request.getName());
        c = categoryRepository.save(c);
        CategoryDto d = new CategoryDto(); d.setId(c.getId()); d.setName(c.getName()); d.setCreatedAt(c.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }

    @GetMapping("/roles")
    public List<RoleDto> listRoles() {
        return roleRepository.findAll().stream().map(r -> {
            RoleDto d = new RoleDto(); d.setId(r.getId()); d.setName(r.getName()); d.setDescription(r.getDescription()); d.setCreatedAt(r.getCreatedAt()); return d;
        }).collect(Collectors.toList());
    }

    @PostMapping("/roles")
    public ResponseEntity<RoleDto> createRole(@RequestBody RoleDto request) {
        com.company.auth.model.Role r = new com.company.auth.model.Role();
        r.setName(request.getName()); r.setDescription(request.getDescription());
        r = roleRepository.save(r);
        RoleDto d = new RoleDto(); d.setId(r.getId()); d.setName(r.getName()); d.setDescription(r.getDescription()); d.setCreatedAt(r.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }

    @GetMapping("/orders")
    public List<OrderDto> listOrders() {
        return orderRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/orders")
    public ResponseEntity<OrderDto> createOrder(@RequestBody CreateOrderRequest request) {
        OrderEntity order = new OrderEntity();
        order.setUserId(request.getUserId());
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(request.getStatus() == null ? "PENDING" : request.getStatus());

        order = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(order));
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private ProductDto toDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setSku(product.getSku());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }

    private OrderDto toDto(OrderEntity order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
}
