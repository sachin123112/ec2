I've started the repository update and committed the first backend-design change to `sachin123112/ec2`.

**Commit SHA**

```text
445ded9e8d760c08ea02d927cd33f63ebefa37da
```

### What was added

* Updated `README.md`
* Defined the target stack:

  * Java 21
  * Spring Boot 3
  * PostgreSQL
  * Redis
  * Kafka
  * Docker
  * Kubernetes
* Added architecture roadmap and implementation phases

### Recommended next phase

I can now generate and commit the actual project structure:

```text
backend/
├── docs/
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-specification.md
│   ├── security-design.md
│   ├── deployment-architecture.md
│   └── scalability.md
│
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
│
└── database/
    └── migrations/
```

I can also scaffold a complete **Spring Boot multi-module Maven project** and commit it directly to the repository as the next step.
-------------------------------------------------------------------------------------------------------------
I've started scaffolding the repository and successfully committed additional backend structure files.

### New commits created

* Architecture document added

  ```text
  a81df9566817eaf3397d8cf0e44a1eec5efc9330
  ```
* Parent Maven project (`pom.xml`) added

  ```text
  e84985b3f0575ec329d78f80a14e2171f215e371
  ```
* Auth service scaffold added

  ```text
  74acf45295e712153c45795d22494865bf3bdb31
  ```

### Current repository structure

```text
/
├── README.md
├── pom.xml
├── docs/
│   └── architecture.md
│
└── services/
    └── auth-service/
        └── README.md
```

### Next recommended step

Build the actual Spring Boot multi-module structure:

```text
services/
├── auth-service/
│   ├── pom.xml
│   └── src/main/java/...
│
├── user-service/
│   ├── pom.xml
│   └── src/main/java/...
│
├── order-service/
│   ├── pom.xml
│   └── src/main/java/...
│
├── product-service/
├── payment-service/
└── notification-service/
```

Then add:

* Spring Boot parent configuration
* Flyway migrations
* PostgreSQL configuration
* JWT Security
* Dockerfiles
* Docker Compose
* Kubernetes manifests
* GitHub Actions CI/CD

That would turn the repository from documentation into a runnable enterprise backend foundation.
--------------------------------------------------------------------------------------------------------------------

Flyway migration scripts have been added to the repository.

### Commits

**V1 – Users table**

```text
27c578f68d7bbd393023d68640a7f2dd256f1637
```

**V2 – Products table**

```text
356247a9bb89b2c385af7fb9f90d9a8314f62186
```

**V3 – Orders table**

```text
3482bb8e7d8b038e8c36d7a6d7d938bad833269a
```

### Current migration structure

```text
database/
└── migrations/
    ├── V1__create_users.sql
    ├── V2__create_products.sql
    └── V3__create_orders.sql
```

### Recommended next migrations

```text
V4__create_roles.sql
V5__create_user_roles.sql
V6__create_categories.sql
V7__create_order_items.sql
V8__create_payments.sql
V9__create_notifications.sql
V10__create_audit_logs.sql
```

### Next infrastructure step

Configure Flyway in Spring Boot:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/backend
    username: postgres
    password: postgres

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

The next logical step is to add the `auth-service` runnable Spring Boot module with:

* `pom.xml`
* `Application.java`
* JWT security configuration
* Flyway dependency
* PostgreSQL configuration
* Dockerfile

so the project can build and run locally.
-----------------------------------------------------------------------------------------------------------------
I can add the PostgreSQL configuration, but I don't currently have access to the GitHub repository editing functions in this turn.

Create the following file in the Spring Boot service (for example, `services/auth-service/src/main/resources/application.yml`):

```yaml
spring:
  application:
    name: auth-service

  datasource:
    url: jdbc:postgresql://localhost:5432/backend_platform
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: 8081

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

Add the PostgreSQL and Flyway dependencies to the service `pom.xml`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>

<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

For Docker Compose:

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: backend_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

For production, move credentials to environment variables:

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

After PostgreSQL configuration, the next step should be **JWT Security Configuration** so authentication and authorization are wired into the Auth Service.
-----------------------------------------------------------------------------------------------------------------
For Spring Boot 3 + Java 21, implement JWT authentication using **Spring Security 6**.

## Project Structure

```text id="7zq3fx"
auth-service/
└── src/main/java/com/company/auth/
    ├── config/
    │   └── SecurityConfig.java
    │
    ├── security/
    │   ├── JwtAuthenticationFilter.java
    │   ├── JwtService.java
    │   └── CustomUserDetailsService.java
    │
    ├── controller/
    │   └── AuthController.java
    │
    ├── dto/
    │   ├── LoginRequest.java
    │   └── LoginResponse.java
    │
    └── entity/
        └── User.java
```

---

# Dependencies

Add to `auth-service/pom.xml`

```xml id="hv4c8g"
<dependencies>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.7</version>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.7</version>
        <scope>runtime</scope>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.7</version>
        <scope>runtime</scope>
    </dependency>

</dependencies>
```

---

# application.yml

```yaml id="ofzhrv"
jwt:
  secret: 9f4d3c8a5e2b7f6d1a9c4e8f2b6d3a7c
  expiration: 900000

spring:
  security:
    user:
      name: disabled
```

Store the secret in environment variables for production.

---

# JwtService

```java id="8x72nr"
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(String username) {

        Date now = new Date();

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiration))
                .signWith(
                        Keys.hmacShaKeyFor(secret.getBytes()),
                        Jwts.SIG.HS256)
                .compact();
    }

    public String extractUsername(String token) {

        return Jwts.parser()
                .verifyWith(
                    Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
```

---

# JWT Authentication Filter

```java id="tm5hgs"
@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null ||
            !authHeader.startsWith("Bearer ")) {

            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        String username =
                jwtService.extractUsername(token);

        if (username != null &&
            SecurityContextHolder.getContext()
                .getAuthentication() == null) {

            UserDetails user =
                    userDetailsService
                        .loadUserByUsername(username);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            user.getAuthorities());

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }
}
```

---

# SecurityConfig

```java id="l2i7gb"
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtFilter;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                .requestMatchers(
                    "/api/v1/auth/**",
                    "/actuator/health")
                .permitAll()

                .requestMatchers(
                    "/api/v1/admin/**")
                .hasRole("ADMIN")

                .anyRequest()
                .authenticated())

            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

# Login Request DTO

```java id="sqpycu"
public record LoginRequest(
        String username,
        String password) {
}
```

---

# Login Response DTO

```java id="dk1slr"
public record LoginResponse(
        String accessToken,
        String tokenType) {
}
```

---

# Auth Controller

```java id="u2chc2"
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.username(),
                request.password()));

        String token =
                jwtService.generateToken(
                    request.username());

        return new LoginResponse(
                token,
                "Bearer");
    }
}
```

---

# Password Storage

Store passwords using BCrypt:

```java id="pp3xzk"
String encoded =
        passwordEncoder.encode(rawPassword);
```

Never store plain-text passwords.

---

# Protected Endpoint Example

```java id="d9kjcz"
@GetMapping("/profile")
public UserProfile getProfile() {
    return service.getCurrentUser();
}
```

Request:

```http id="gwh0we"
GET /api/v1/users/profile

Authorization: Bearer eyJhbGciOi...
```

---

# Recommended Next Enhancements

1. Refresh Tokens
2. Role-Based Access Control (RBAC)
3. User Registration API
4. Logout with token blacklist (Redis)
5. MFA (TOTP)
6. OAuth2 Login (Google/Microsoft)
7. API Gateway JWT validation
8. Key rotation using RS256 public/private keys

For production, prefer **RS256** (public/private key pair) instead of a shared HS256 secret, and store keys in a secrets manager rather than configuration files.

