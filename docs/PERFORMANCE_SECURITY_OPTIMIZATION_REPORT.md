# Performance, Scalability, and Security Review

## Scope and evidence

Reviewed the Spring Boot auth service, the user/order service entry points, PostgreSQL migrations and repositories, Redis/Elasticsearch/Docker Compose/Kubernetes configuration, and the React frontend. Validation performed on 2026-08-28:

- `mvn -pl services/auth-service -am test`: 9 tests passed.
- `npm run build`: passed; Vite reported a 587.44 kB minified JavaScript bundle.
- `npm run lint`: failed with 6 existing errors and 1 warning in frontend files.
- `docker build --check -f services/auth-service/Dockerfile .`: passed with no warnings.

Static review is not a substitute for a production load test. Capture p50/p95/p99 latency, DB CPU/IO, pool saturation, cache hit ratio, error rate, and heap/GC behavior before and after each rollout.

## Changes applied

1. Added optional Redis cache support to `auth-service`.
   - `CACHE_TYPE` defaults to `none`, so local deployments do not require Redis.
   - Product and category list responses use a 60-second cache when Redis is enabled.
   - Product/category writes evict the corresponding cache.
   - Redis failures are logged and bypassed so PostgreSQL remains the source of truth.
   - Search results, orders, users, notifications, payment settings, and authentication tokens are intentionally not cached by these annotations.
2. Replaced admin revenue/status full-table scans with PostgreSQL aggregate queries.
3. Added indexes for user-order pagination/filtering, order status analytics, addresses, refresh tokens, and reset-token expiry.
4. Changed product images to lazy loading and disabled Open Session in View; product listing remains inside a read-only transaction.
5. Removed wildcard controller CORS and made allowed origins configurable with `CORS_ALLOWED_ORIGINS`.
6. Removed committed fallback mail, database, development-user, and JWT secret values from `application.yml`.

## Redis strategy

| Data or endpoint | Recommendation | Suggested policy |
|---|---|---|
| `GET /api/v1/products` | Cache | Cache-aside, key `products:all`, TTL 60 seconds, evict on product create/delete. Add versioned keys if multiple catalog variants appear. |
| `GET /api/v1/categories` | Cache | Key `categories:all`, TTL 5-15 minutes, evict on category create/delete. |
| Product search | Do not add Redis in front of Elasticsearch | Elasticsearch should own text search, filtering, sorting, and pagination. Cache only measured, repeated anonymous queries with a short TTL after hit-rate measurement. |
| Orders, payments, stock, addresses | Do not cache by default | These are user-specific or transactional. Use indexed, paginated database queries and transaction boundaries. |
| Login and refresh tokens | Do not cache responses | Store refresh-token state in PostgreSQL until a deliberate token-session design moves it to Redis with TTL, revocation, and hashed token values. Never cache passwords or JWTs as general response data. |
| Rate limits and idempotency keys | Use Redis | Add a gateway/filter-level token bucket and short-lived idempotency keys for order creation. This is a future high-value Redis use because it coordinates replicas. |
| Distributed locks | Use only for a measured race | Prefer database uniqueness/locking for SKU and stock correctness. Use a Redis lock only with ownership, expiry, fencing/idempotency, and a failure policy. |

Prevent stampedes with bounded TTL jitter, request coalescing/single-flight, or a short lock only for expensive keys. Never use stale cached payment configuration or stock as the authority for a purchase.

## Highest-priority remaining findings

### Critical security and correctness

- `AuthController` logs password-reset tokens to stdout. Remove this immediately and deliver reset links only through a controlled email provider; rotate any tokens exposed in logs.
- `AuthService` contains a legacy path that accepts a stored password directly when it is not a BCrypt hash. Remove plaintext-password compatibility after migration and force a password reset for affected accounts.
- `PaymentSettings` and its DTO expose a Razorpay secret field through an API model. Store provider secrets in a secret manager and return only a masked/configured flag to clients.
- Google OAuth callback places access and refresh tokens in the frontend URL query string. Replace this with a secure, short-lived one-time code or HTTP-only secure cookie flow; query strings leak through history, referrers, and logs.
- Kubernetes/PostgreSQL Redis manifests contain plaintext/default credentials or no Redis authentication. Use Kubernetes Secrets, TLS where required, NetworkPolicies, and non-public ClusterIP services. Rotate any credentials committed previously.
- Keep `CORS_ALLOWED_ORIGINS` to exact trusted HTTPS origins in production. Do not use `*` with authenticated APIs.

### Backend and database bottlenecks

- `ApiController.listUsers`, `listProducts`, `listCategories`, `listLinks`, and admin order/user endpoints return unbounded arrays. Add `Pageable`/bounded limits and stable `(created_at, id)` keyset pagination. Preserve old endpoints only during a versioned migration.
- `SearchService` calls `findAll()` on Elasticsearch or PostgreSQL and filters in Java. Replace with Elasticsearch queries and `search_after`/page limits; use database predicates only as a bounded fallback.
- `Product.images` was eager and could create large object graphs/N+1 behavior; it is now lazy. Add repository-level entity graphs or projections for the exact read model and test query counts.
- `OrderRepository.findByUserId` needs ordering and pagination. Add `findByUserIdOrderByCreatedAtDesc` with a `Pageable` parameter and use the new composite index.
- SKU generation reads the highest SKU then increments in application code, which races under concurrent creates. Use a database sequence or an insert/retry strategy around the unique constraint.
- Order creation writes order and payment separately, sends email synchronously, and indexes synchronously. Put both writes in one transaction and move email/search indexing to an outbox plus worker; make consumers idempotent.
- Configure Hikari maximum/minimum pool sizes from measured DB capacity, connection timeout, leak detection in non-production testing, and statement/read timeouts. Do not increase pool size independently on every replica.
- Add DTO validation (`@Valid`, size/pattern/range/email constraints), consistent error envelopes, and request body/multipart size limits.

### Frontend

- `Dashboard` fetches all products, all orders, categories, and then all notifications on load; `UserDashboard` repeats overlapping requests. Add a query/data-fetch layer with request deduplication, cancellation, stale-while-revalidate, and server-side dashboard summary endpoints.
- The frontend stores access and refresh tokens in `localStorage`, exposing them to XSS. Prefer an HTTP-only, Secure, SameSite refresh cookie and short-lived in-memory access tokens with CSRF protection for cookie-authenticated requests.
- Split the 587 kB bundle with route-level `lazy()`/dynamic imports, especially admin pages and Chart.js. Virtualize long tables and debounce server-side search.
- Fix the six lint errors and one hook-dependency warning before enabling lint as a CI gate.

### Deployment and reliability

- Kubernetes `auth-service` currently declares/service-routes port `8081`, while the app default is `8080`; align the manifests or explicitly set `SERVER_PORT`.
- Add readiness and liveness probes, resource requests/limits, graceful shutdown, rolling-update settings, and PodDisruptionBudgets. HPA should consider CPU plus request rate/latency where available.
- Redis and PostgreSQL are single replicas in Kubernetes. For production use managed HA services or documented replication/failover; a single Redis pod is a cache availability risk, not a scalable cache tier.
- Pin container images by immutable digest instead of `latest`, scan images/dependencies, and run containers as non-root with a read-only filesystem where compatible.
- Add gateway rate limiting, request correlation IDs, structured JSON logs, Micrometer/Prometheus metrics, tracing, and alerting for DB pool exhaustion, Redis errors/hit ratio, Elasticsearch latency, 5xx rate, and p99 latency.
- The project contains multiple migration roots (`database/migrations`, `backend-platform/src/main/resources/db/migration`, and the service migration tree). Keep one authoritative Flyway location and test migrations against a clean database and an upgrade database.
- `user-service` and `order-service` currently contain only application entry points in the inspected source tree, while the auth service owns most APIs. Either consolidate intentionally or complete service boundaries before scaling independently.

## Recommended delivery order

1. Remove leaked/default secrets, reset-token logging, OAuth query-token flow, and plaintext-password compatibility.
2. Fix Kubernetes port/probes/resources and secure Redis/PostgreSQL configuration.
3. Add bounded pagination and database-side queries for products, orders, users, logs, and notifications.
4. Add transactional outbox processing for email/search and a concurrency-safe SKU/stock design.
5. Enable Redis in staging with `CACHE_TYPE=redis`, measure hit/miss and latency, then promote only catalog caches.
6. Add frontend request deduplication, dashboard summary APIs, code splitting, and lint-clean CI.
7. Run a representative concurrent load test and tune Hikari, PostgreSQL, Redis, Elasticsearch, and HPA from measurements.

## Enabling the implemented Redis cache

Set these values in a non-development environment after provisioning authenticated Redis:

```text
CACHE_TYPE=redis
CACHE_DEFAULT_TTL=PT60S
REDIS_HOST=<private-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<secret-from-secret-manager>
CORS_ALLOWED_ORIGINS=https://app.example.com
JWT_SECRET=<random-32-byte-or-longer-secret>
```

Do not enable this configuration until the Redis endpoint and credentials are available. With the default `CACHE_TYPE=none`, the application continues to use PostgreSQL without cache operations.
