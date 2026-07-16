# Redis Setup

## Overview
This document explains how to run Redis locally (Docker Compose), in Kubernetes, and how to configure Spring Boot to connect to it. It also includes verification and troubleshooting steps.

## Quick Start — Docker Compose
Add this to `docker-compose.yml` (or run as a separate compose file):

```yaml
version: "3.8"
services:
  redis:
    image: redis:7.2
    container_name: redis
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD:-changeme}"]
    environment:
      - REDIS_PASSWORD=changeme
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

Start:
```bash
docker compose up -d redis
```

Connect (local):
```bash
redis-cli -a changeme ping
# expected: PONG
```

## Kubernetes Example
Create a secret and deployment+service. Example manifests:

- Secret (stores password)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: redis-secret
type: Opaque
stringData:
  redis-password: changeme
```

- StatefulSet (or Deployment) + Service (minimal example)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7.2
          args: ["redis-server", "--requirepass", "$(REDIS_PASSWORD)"]
          env:
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: redis-secret
                  key: redis-password
          ports:
            - containerPort: 6379
          volumeMounts:
            - mountPath: /data
              name: redis-data
      volumes:
        - name: redis-data
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
    - port: 6379
      targetPort: 6379
  type: ClusterIP
```

Apply:
```bash
kubectl apply -f redis-secret.yaml
kubectl apply -f redis-deployment.yaml
```

Verify and port-forward for local testing:
```bash
kubectl get pods -l app=redis
kubectl port-forward svc/redis 6379:6379
redis-cli -h 127.0.0.1 -p 6379 -a changeme ping
```

## Spring Boot Configuration
If you use `spring-boot-starter-data-redis` (Lettuce by default), configure connection in `application.yml` or `application.properties`.

- `application.yml` example:
```yaml
spring:
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:changeme}
    timeout: 2000ms
```

- `application.properties` example:
```
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=${REDIS_PORT:6379}
spring.redis.password=${REDIS_PASSWORD:changeme}
spring.redis.timeout=2000ms
```

Environment variables (example for Docker or k8s):
```
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=changeme
```

### Optional Java config (only if custom configuration needed)
```java
@Configuration
public class RedisConfig {
    @Bean
    public LettuceConnectionFactory redisConnectionFactory(Environment env) {
        var host = env.getProperty("spring.redis.host", "localhost");
        var port = Integer.parseInt(env.getProperty("spring.redis.port", "6379"));
        var pass = env.getProperty("spring.redis.password");
        RedisStandaloneConfiguration cfg = new RedisStandaloneConfiguration(host, port);
        if (pass != null && !pass.isBlank()) cfg.setPassword(pass);
        return new LettuceConnectionFactory(cfg);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(LettuceConnectionFactory cf) {
        RedisTemplate<String, Object> rt = new RedisTemplate<>();
        rt.setConnectionFactory(cf);
        return rt;
    }
}
```

## Usage Examples
Set a value from the app (Spring):
```java
@Autowired
private RedisTemplate<String, String> redisTemplate;

redisTemplate.opsForValue().set("key", "value", Duration.ofMinutes(10));
String v = redisTemplate.opsForValue().get("key");
```

From CLI (when port-forwarded or local):
```bash
redis-cli -h 127.0.0.1 -p 6379 -a changeme set hello world
redis-cli -h 127.0.0.1 -p 6379 -a changeme get hello
```

## High Availability & Persistence Notes
- For production, use Redis Sentinel or Redis Cluster for HA.
- Use a StatefulSet + persistent volumes in Kubernetes.
- Consider managed services (Azure Cache, AWS ElastiCache) to avoid ops overhead.
- Secure access with network policies, secrets, and don't expose Redis publicly.

## Verification & Troubleshooting
- Check pod logs:
```bash
kubectl logs -l app=redis
```
- Verify connectivity from app pod:
```bash
kubectl exec -it <app-pod> -- redis-cli -h redis -p 6379 -a $(kubectl get secret redis-secret -o jsonpath='{.data.redis-password}' | base64 --decode) ping
```
- Common errors:
  - "NOAUTH Authentication required" — ensure password configured both server and client.
  - Connection refused — host/port mismatch or Service not created.
  - Wrong encoding or firewall issues on Windows — ensure Docker for Windows / WSL networking allows localhost:6379.

## Security
- Never commit plain-text passwords. Use Kubernetes `Secret` or environment variables from CI/CD secrets.
- Use network policies and VPC to restrict access.
- Enable TLS (stunnel or native TLS in managed offerings) for cross-network traffic.

---

If you want, I can:
- create `services/auth-service/docs/REDIS_SETUP.md` with this content, or
- add a short Docker Compose override specifically for local development and wire it into existing compose files.

Which would you like next?
