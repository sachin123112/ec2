package com.company.auth.controller;

import com.company.auth.dto.AddressDto;
import com.company.auth.dto.AddressRequest;
import com.company.auth.dto.CategoryDto;
import com.company.auth.dto.CreateLinkRequest;
import com.company.auth.dto.CreateOrderRequest;
import com.company.auth.dto.CreateProductRequest;
import com.company.auth.dto.CreateUserRequest;
import com.company.auth.dto.ChangePasswordRequest;
import com.company.auth.dto.LinkDto;
import com.company.auth.dto.OrderDto;
import com.company.auth.dto.ProductDto;
import com.company.auth.dto.RoleDto;
import com.company.auth.dto.UserDto;
import com.company.auth.dto.UserUpdateRequest;
import com.company.auth.model.Address;
import com.company.auth.model.Category;
import com.company.auth.model.Link;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.Product;
import com.company.auth.model.ProductImage;
import com.company.auth.model.Payment;
import com.company.auth.model.User;
import com.company.auth.document.OrderDocument;
import com.company.auth.document.ProductDocument;
import com.company.auth.repository.AddressRepository;
import com.company.auth.repository.CategoryRepository;
import com.company.auth.repository.LinkRepository;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.ProductRepository;
import com.company.auth.repository.PaymentRepository;
import com.company.auth.repository.RoleRepository;
import com.company.auth.repository.UserRepository;
import com.company.auth.service.SearchService;
import com.company.auth.service.EmailNotificationService;
import com.company.auth.service.ImageKitImageService;
import com.company.auth.repository.PaymentSettingsRepository;
import com.company.auth.model.PaymentSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1")
public class ApiController {

    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CategoryRepository categoryRepository;
    private final RoleRepository roleRepository;
    private final AddressRepository addressRepository;
    private final LinkRepository linkRepository;
    private final PasswordEncoder passwordEncoder;
    private final SearchService searchService;
    private final EmailNotificationService emailNotificationService;
    private final ImageKitImageService imageKitImageService;
    private final PaymentSettingsRepository paymentSettingsRepository;

    public ApiController(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            CategoryRepository categoryRepository,
            RoleRepository roleRepository,
            AddressRepository addressRepository,
            LinkRepository linkRepository,
            PasswordEncoder passwordEncoder,
            SearchService searchService,
            EmailNotificationService emailNotificationService,
            ImageKitImageService imageKitImageService,
            PaymentSettingsRepository paymentSettingsRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.categoryRepository = categoryRepository;
        this.roleRepository = roleRepository;
        this.addressRepository = addressRepository;
        this.linkRepository = linkRepository;
        this.passwordEncoder = passwordEncoder;
        this.searchService = searchService;
        this.emailNotificationService = emailNotificationService;
        this.imageKitImageService = imageKitImageService;
        this.paymentSettingsRepository = paymentSettingsRepository;
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

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            user.getRoles().clear();
            roleRepository.findAllById(request.getRoleIds()).forEach(user.getRoles()::add);
        }

        user = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products")
        @Operation(summary = "List products", description = "Return all products")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Array of products",
                content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProductDto.class))))
        })
        public List<ProductDto> listProducts() {
        return productRepository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested. Elasticsearch available={}", searchService.isElasticsearchAvailable());
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "elasticsearchAvailable", searchService.isElasticsearchAvailable()
        ));
    }

    @GetMapping("/products/search")
        @Operation(summary = "Search products", description = "Search products by query or category")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results",
                content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProductDto.class))))
        })
        public List<ProductDto> searchProducts(@RequestParam(required = false) String q,
                           @RequestParam(required = false) String category) {
        return searchService.searchProducts(q, category).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping(value = "/products", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create product (JSON)", description = "Create a product from JSON payload")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created product",
                content = @Content(schema = @Schema(implementation = ProductDto.class)))
        })
        public ResponseEntity<ProductDto> createProduct(@RequestBody CreateProductRequest request) {
            Category category = getRequiredCategory(request.getCategoryId());
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
            product.setSku(generateSku(category));
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
            product.setCategory(category);

        product = productRepository.save(product);
        searchService.indexProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(product));
    }

    @Operation(summary = "Create product (multipart)", description = "Create a product with optional images (multipart/form-data)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Created product",
            content = @Content(schema = @Schema(implementation = ProductDto.class)))
    })
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProduct(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String sku,
            @RequestParam BigDecimal price,
            @RequestParam(required = false) Integer stockQuantity,
            @RequestParam(required = false) Long categoryId,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {
        Category category = getRequiredCategory(categoryId);
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setSku(generateSku(category));
        product.setPrice(price);
        product.setStockQuantity(stockQuantity != null ? stockQuantity : 0);
        product.setCategory(category);

        product = productRepository.save(product);

        if (images != null && images.length > 0) {
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    String imageUrl = imageKitImageService.uploadProductImage(image, product.getId());
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUrl(imageUrl);
                    product.addImage(productImage);
                }
            }
            product = productRepository.save(product);
        }

        searchService.indexProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        searchService.deleteProduct(id);
        return ResponseEntity.noContent().build();
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

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    public List<RoleDto> listRoles() {
        return roleRepository.findAll().stream().map(r -> {
            RoleDto d = new RoleDto(); d.setId(r.getId()); d.setName(r.getName()); d.setDescription(r.getDescription()); d.setCreatedAt(r.getCreatedAt()); d.setPermissions(r.getPermissions().stream().sorted().toList()); return d;
        }).collect(Collectors.toList());
    }

    @PostMapping("/roles")
    public ResponseEntity<RoleDto> createRole(@RequestBody RoleDto request) {
        com.company.auth.model.Role r = new com.company.auth.model.Role();
        r.setName(request.getName()); r.setDescription(request.getDescription());
        if (request.getPermissions() != null) r.getPermissions().addAll(request.getPermissions());
        r = roleRepository.save(r);
        RoleDto d = new RoleDto(); d.setId(r.getId()); d.setName(r.getName()); d.setDescription(r.getDescription()); d.setCreatedAt(r.getCreatedAt()); d.setPermissions(r.getPermissions().stream().sorted().toList());
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<RoleDto> updateRole(@PathVariable Long id, @RequestBody RoleDto request) {
        com.company.auth.model.Role role = roleRepository.findById(id).orElse(null);
        if (role == null) return ResponseEntity.notFound().build();
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.getPermissions().clear();
        if (request.getPermissions() != null) role.getPermissions().addAll(request.getPermissions());
        role = roleRepository.save(role);
        RoleDto dto = new RoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setPermissions(role.getPermissions().stream().sorted().toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/links")
    public List<LinkDto> listLinks() {
        return linkRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/links")
    public ResponseEntity<LinkDto> createLink(@RequestBody CreateLinkRequest request) {
        Link link = new Link();
        link.setLabel(request.getLabel());
        link.setUrl(request.getUrl());
        link.setDescription(request.getDescription());
        link.setIsActive(request.getIsActive() == null ? true : request.getIsActive());
        link = linkRepository.save(link);

        LinkDto dto = toDto(link);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/links/{id}")
    public ResponseEntity<Void> deleteLink(@PathVariable Long id) {
        if (!linkRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        linkRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
        @Operation(summary = "List orders", description = "Return all orders (admin or scoped to user)")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Array of orders",
                content = @Content(array = @ArraySchema(schema = @Schema(implementation = OrderDto.class))))
        })
        public List<OrderDto> listOrders(Authentication authentication) {
        List<OrderEntity> orders;
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (isAdmin) {
            orders = orderRepository.findAll();
        } else {
            User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            orders = orderRepository.findByUserId(user.getId());
        }
        return orders.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/orders/search")
    @Operation(summary = "Search orders", description = "Search orders by query and date range")
    public List<OrderDto> searchOrders(@RequestParam(required = false) String q,
                                       @RequestParam(required = false) String startDate,
                                       @RequestParam(required = false) String endDate) {
        return searchService.searchOrders(q, startDate, endDate).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/orders")
        @Operation(summary = "Create order", description = "Create a new order")
        @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created order",
                content = @Content(schema = @Schema(implementation = OrderDto.class)))
        })
        public ResponseEntity<OrderDto> createOrder(
            Authentication authentication, @RequestBody CreateOrderRequest request) {
        OrderEntity order = new OrderEntity();
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        Long orderUserId = request.getUserId();
        if (!isAdmin) {
            orderUserId = userRepository.findByEmail(authentication.getName())
                .map(user -> user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        }
        if (orderUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required to create an order");
        }
        order.setUserId(orderUserId);
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(request.getStatus() == null ? "PENDING" : request.getStatus());
        String paymentMethod = request.getPaymentMethod() == null
            ? "COD"
            : request.getPaymentMethod().trim().toUpperCase();
        if (!List.of("CARD", "UPI", "NET_BANKING", "CREDIT_CARD", "DEBIT_CARD", "QR_CODE", "COD").contains(paymentMethod)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported payment method");
        }
        PaymentSettings paymentSettings = paymentSettingsRepository.findById(1L).orElseGet(PaymentSettings::new);
        boolean enabled = "CARD".equals(paymentMethod) && (paymentSettings.isCreditCardActive() || paymentSettings.isDebitCardActive())
            || "CREDIT_CARD".equals(paymentMethod) && paymentSettings.isCreditCardActive()
            || "DEBIT_CARD".equals(paymentMethod) && paymentSettings.isDebitCardActive()
            || "UPI".equals(paymentMethod) && paymentSettings.isUpiActive()
            || "NET_BANKING".equals(paymentMethod) && paymentSettings.isNetBankingActive()
            || "QR_CODE".equals(paymentMethod) && paymentSettings.isQrCodeActive()
                || "COD".equals(paymentMethod) && paymentSettings.isCashOnDeliveryActive();
        if (!enabled) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This payment method is currently unavailable");
        }

        order = orderRepository.save(order);
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setPaymentMethod(paymentMethod);
        paymentRepository.save(payment);
        OrderEntity savedOrder = order;
        searchService.indexOrder(savedOrder);
        userRepository.findById(savedOrder.getUserId()).ifPresent(user -> emailNotificationService.sendOrderCreated(savedOrder, user));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(savedOrder));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update order status", description = "Update an order status and email the order owner")
    public OrderDto updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        String nextStatus = status == null ? "" : status.trim().toUpperCase();
        if (!List.of("PENDING", "PROCESSING", "COMPLETED", "CANCELED").contains(nextStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported order status");
        }
        boolean statusChanged = !nextStatus.equalsIgnoreCase(order.getStatus());
        order.setStatus(nextStatus);
        OrderEntity saved = orderRepository.save(order);
        searchService.indexOrder(saved);
        if (statusChanged) {
            userRepository.findById(saved.getUserId())
                    .ifPresent(user -> emailNotificationService.sendOrderStatusChanged(saved, user));
        }
        return toDto(saved);
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.deleteById(id);
        searchService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/me")
    @Operation(summary = "Get current user", description = "Return the currently authenticated user's profile")
    public UserDto getCurrentUser(Principal principal) {
        User user = findUserByEmail(principal);
        return toDto(user);
    }

    @PostMapping(value = "/users/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload current user profile image")
    public UserDto uploadCurrentUserProfileImage(
            Principal principal, @RequestPart("image") MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile image is required");
        }
        User user = findUserByEmail(principal);
        user.setProfileImageUrl(imageKitImageService.uploadUserImage(image, user.getId()));
        return toDto(userRepository.save(user));
    }

    @PutMapping("/users/me")
    @Operation(summary = "Update current user", description = "Update profile fields for current authenticated user")
    public UserDto updateCurrentUser(Principal principal, @RequestBody UserUpdateRequest request) {
        User user = findUserByEmail(principal);
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getCountryCode() != null) user.setCountryCode(request.getCountryCode());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        user = userRepository.save(user);
        return toDto(user);
    }

    @PostMapping("/users/me/change-password")
    @Operation(summary = "Change current user's password")
    public ResponseEntity<Void> changeCurrentUserPassword(
            Principal principal, @RequestBody ChangePasswordRequest request) {
        User user = findUserByEmail(principal);
        if (!StringUtils.hasText(request.getOldPassword())
                || !passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (!StringUtils.hasText(request.getNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/me/addresses")
    @Operation(summary = "List addresses for current user")
    public List<AddressDto> listCurrentUserAddresses(Principal principal) {
        User user = findUserByEmail(principal);
        return addressRepository.findAllByUserId(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/users/me/addresses")
    @Operation(summary = "Add address for current user")
    public ResponseEntity<AddressDto> addCurrentUserAddress(Principal principal, @RequestBody AddressRequest request) {
        User user = findUserByEmail(principal);
        Address address = new Address();
        address.setUser(user);
        mapAddressRequest(address, request);
        Address saved = addressRepository.save(address);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    @PutMapping("/addresses/{id}")
    public AddressDto updateAddress(Principal principal, @PathVariable Long id, @RequestBody AddressRequest request) {
        User user = findUserByEmail(principal);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Address does not belong to user");
        }
        mapAddressRequest(address, request);
        return toDto(addressRepository.save(address));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(Principal principal, @PathVariable Long id) {
        User user = findUserByEmail(principal);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Address does not belong to user");
        }
        addressRepository.delete(address);
        return ResponseEntity.noContent().build();
    }

    private void mapAddressRequest(Address address, AddressRequest request) {
        address.setLabel(request.getLabel());
        address.setName(request.getName());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
    }

    private User findUserByEmail(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated request");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
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

    private AddressDto toDto(Address address) {
        AddressDto dto = new AddressDto();
        dto.setId(address.getId());
        dto.setLabel(address.getLabel());
        dto.setName(address.getName());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setPhone(address.getPhone());
        dto.setIsDefault(address.getIsDefault());
        return dto;
    }

    private Category getRequiredCategory(Long categoryId) {
        if (categoryId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required to generate SKU");
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found: " + categoryId));
    }

    private String generateSku(Category category) {
        String prefix = category.getName().trim().toUpperCase()
                .replaceAll("[^A-Z0-9]+", "-")
                .replaceAll("^-|-$", "");
        int nextNumber = productRepository.findTopBySkuStartingWithOrderBySkuDesc(prefix + "-")
            .map(product -> product.getSku())
                .map(sku -> sku.substring(prefix.length() + 1))
                .filter(suffix -> suffix.matches("\\d+"))
                .map(Integer::parseInt)
                .orElse(0) + 1;
        return prefix + "-" + String.format("%04d", nextNumber);
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
        if (product.getImages() != null) {
            dto.setImageUrls(product.getImages().stream().map(i -> i.getImageUrl()).collect(Collectors.toList()));
        }
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }

    private ProductDto toDto(ProductDocument document) {
        ProductDto dto = new ProductDto();
        dto.setId(document.getId());
        dto.setName(document.getName());
        dto.setDescription(document.getDescription());
        dto.setSku(document.getSku());
        dto.setPrice(document.getPrice());
        dto.setStockQuantity(document.getStockQuantity());
        dto.setCategoryName(document.getCategoryName());
        dto.setImageUrls(document.getImageUrls());
        dto.setCreatedAt(document.getCreatedAt());
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

    private OrderDto toDto(OrderDocument document) {
        OrderDto dto = new OrderDto();
        dto.setId(document.getId());
        dto.setOrderNumber(document.getOrderNumber());
        dto.setTotalAmount(document.getTotalAmount());
        dto.setStatus(document.getStatus());
        dto.setCreatedAt(document.getCreatedAt());
        return dto;
    }

    private LinkDto toDto(Link link) {
        LinkDto dto = new LinkDto();
        dto.setLabel(link.getLabel());
        dto.setUrl(link.getUrl());
        dto.setDescription(link.getDescription());
        dto.setIsActive(link.getIsActive());
        dto.setCreatedAt(link.getCreatedAt());
        return dto;
    }
}
