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
