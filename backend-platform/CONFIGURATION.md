# Centralized Configuration

The shared runtime configuration is in `config/application.yml`. Service modules import it, and Docker images package the same file at `/app/config/application.yml`.

## Local development

1. Copy `.env.example` to `.env`.
2. Set local credentials and third-party secrets in `.env`. The file is ignored by Git.
3. Start the complete stack from `backend-platform`:

```powershell
docker compose up --build
```

Compose loads `.env` for shared values and applies only container-specific overrides such as `DB_URL=jdbc:postgresql://postgres:5432/backend_platform` and service ports.

The application host ports are deliberately limited to backend `8080` and frontend `5173`. PostgreSQL, Redis, Elasticsearch, and the user/order services are internal Docker services. The mobile Expo/Metro development server uses host port `8081` when started from `mobile/`.

For host Maven execution, `.env` is not loaded automatically. Set `DB_URL` to a host-reachable database, for example `jdbc:postgresql://127.0.0.1:5432/ec2_db`, then run the service.

## Environments

Keep application code unchanged between environments. Use the same `config/application.yml` and provide environment-specific values through the deployment environment or secret manager. Set `SPRING_PROFILES_ACTIVE` only for non-secret behavior that genuinely differs by environment; never put credentials in profile files.

Required production practice:

- Store database, Redis, JWT, SMTP, OAuth, ImageKit, and cloud credentials in a secret manager or injected environment variables.
- Keep `.env` local-only; commit `.env.example` with placeholders only.
- Use a private database and Redis network. Do not expose either service publicly.
- Use a unique production `JWT_SECRET`, database password, Redis password, and SMTP credential.
- Set `JPA_DDL_AUTO=validate` in staging and production; run schema changes through Flyway.
- Tune `DB_POOL_MAX_SIZE` from measured database capacity across all service replicas, not independently per service.

Changing a shared non-secret setting in `config/application.yml`, or changing an injected environment value, is reflected by every service on its next restart or redeployment.
