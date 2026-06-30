package com.company.auth.controller;

import com.company.auth.dto.AuthResponse;
import com.company.auth.dto.AddressDto;
import com.company.auth.dto.AddressRequest;
import com.company.auth.dto.CategoryDto;
import com.company.auth.dto.CreateLinkRequest;
import com.company.auth.dto.CreateOrderRequest;
import com.company.auth.dto.CreateProductRequest;
import com.company.auth.dto.CreateUserRequest;
import com.company.auth.dto.LinkDto;
import com.company.auth.dto.LoginRequest;
import com.company.auth.dto.OrderDto;
import com.company.auth.dto.ProductDto;
import com.company.auth.dto.RoleDto;
import com.company.auth.dto.UserDto;
import com.company.auth.dto.UserUpdateRequest;
import com.company.auth.model.Address;
import com.company.auth.model.Link;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.Product;
import com.company.auth.model.ProductImage;
import com.company.auth.model.User;
import com.company.auth.repository.AddressRepository;
import com.company.auth.repository.CategoryRepository;
import com.company.auth.repository.LinkRepository;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.ProductRepository;
import com.company.auth.repository.RoleRepository;
import com.company.auth.repository.UserRepository;
import com.company.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
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
    private final AddressRepository addressRepository;
    private final LinkRepository linkRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public ApiController(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            CategoryRepository categoryRepository,
            RoleRepository roleRepository,
            AddressRepository addressRepository,
            LinkRepository linkRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
        this.roleRepository = roleRepository;
        this.addressRepository = addressRepository;
        this.linkRepository = linkRepository;
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
    public List<ProductDto> listProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping(value = "/products", consumes = MediaType.APPLICATION_JSON_VALUE)
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

    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProduct(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String sku,
            @RequestParam BigDecimal price,
            @RequestParam(required = false) Integer stockQuantity,
            @RequestParam(required = false) Long categoryId,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setSku(sku);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity != null ? stockQuantity : 0);
        if (categoryId != null) {
            categoryRepository.findById(categoryId).ifPresent(product::setCategory);
        }

        product = productRepository.save(product);

        if (images != null && images.length > 0) {
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    String imageUrl = saveProductImage(image, product.getId());
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUrl(imageUrl);
                    product.addImage(productImage);
                }
            }
            product = productRepository.save(product);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
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

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/me")
    public UserDto getCurrentUser(Principal principal) {
        User user = findUserByEmail(principal);
        return toDto(user);
    }

    @PutMapping("/users/me")
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

    @GetMapping("/users/me/addresses")
    public List<AddressDto> listCurrentUserAddresses(Principal principal) {
        User user = findUserByEmail(principal);
        return addressRepository.findAllByUserId(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/users/me/addresses")
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

    private String saveProductImage(MultipartFile file, Long productId) {
        try {
            Path uploadRoot = Paths.get("uploads", "product-images");
            Files.createDirectories(uploadRoot);
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = String.format("%d_%d_%s", productId, System.currentTimeMillis(), originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_"));
            Path destinationFile = uploadRoot.resolve(fileName).normalize().toAbsolutePath();
            file.transferTo(destinationFile);
            return "/product-images/" + fileName;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store product image", ex);
        }
    }

    private LinkDto toDto(Link link) {
        LinkDto dto = new LinkDto();
        dto.setId(link.getId());
        dto.setLabel(link.getLabel());
        dto.setUrl(link.getUrl());
        dto.setDescription(link.getDescription());
        dto.setIsActive(link.getIsActive());
        dto.setCreatedAt(link.getCreatedAt());
        return dto;
    }
}
