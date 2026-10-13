# QuizHub

QuizHub is a quiz and assessment platform with a React frontend, Spring Boot REST API,
MySQL persistence, administrator quiz authoring, student performance reporting, and PDF-based
question extraction.

## Local development

### Requirements

- Java 17+
- Apache Maven 3.8+
- Node.js 22+ and npm
- MySQL 8+

Create a local MySQL database named `quizhub`, then start the backend with the development
profile. The profile defaults to `localhost:3306`, MySQL user `root`, and an empty password;
override them with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` if your local setup differs.
Only the development profile seeds sample student and quiz data.

```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Start the frontend separately:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Development-only demo student accounts are `demo / demo123`
and `priya / pass123`.

To create the first local admin, set `ADMIN_BOOTSTRAP_ENABLED=true`,
`ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_EMAIL`, and `ADMIN_BOOTSTRAP_PASSWORD` in the
backend process environment. Use a unique password of at least 12 characters. The bootstrap
runner does nothing when an admin already exists and never resets an existing password.

## Azure Container Apps

The `backend` and `frontend` directories each contain a Dockerfile and are independent build
contexts. Build them from the repository root:

```powershell
docker build -t quizhub-backend:latest .\backend
docker build -t quizhub-frontend:latest .\frontend
```

Push the images to Azure Container Registry, then deploy them to Azure Container Apps:

1. Configure the backend with internal ingress on port `8080`; keep it inaccessible directly
   from the public internet.
2. Configure the frontend with external ingress on port `8080`. Nginx serves the SPA and
   forwards `/api/*` requests to the backend.
3. Set the frontend container's `API_UPSTREAM` to the backend's internal HTTP URL, without a
   trailing slash (for example, `http://<backend-internal-fqdn>`).
4. Configure the backend environment variables below. Store passwords and signing keys using
   Container Apps secrets or Key Vault references, never in the image or source code.
5. Provide an Azure Database for MySQL Flexible Server endpoint that requires TLS. Flyway
   applies the versioned initial schema migration at startup. The initial migration is for a
   new, empty deployment database; back up and plan a separate migration before connecting an
   existing populated database.
6. Backend health probes may use `/actuator/health/liveness` and
   `/actuator/health/readiness` on port `8080`. Frontend health probe: `/health` on port `8080`.

### Backend environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DB_URL` | Yes | JDBC URL, including `sslMode=REQUIRED` for Azure MySQL |
| `DB_USERNAME` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password; store as a secret |
| `APP_JWT_SECRET` | Yes | Random signing secret of at least 32 bytes; store as a secret |
| `APP_JWT_EXPIRATION_MS` | No | JWT lifetime in milliseconds; defaults to 24 hours |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated exact origins if the API is called cross-origin; leave empty when using the frontend proxy |
| `DB_POOL_MAX_SIZE` | No | Maximum database pool size; defaults to 10 |
| `DB_POOL_MIN_IDLE` | No | Minimum idle database connections; defaults to 2 |
| `ADMIN_BOOTSTRAP_ENABLED` | No | Temporarily set `true` to create the initial admin account |
| `ADMIN_BOOTSTRAP_USERNAME` | For bootstrap | Initial admin username |
| `ADMIN_BOOTSTRAP_EMAIL` | For bootstrap | Initial admin email |
| `ADMIN_BOOTSTRAP_PASSWORD` | For bootstrap | Unique initial password, at least 12 characters; store as a secret |

After the first successful admin bootstrap, set `ADMIN_BOOTSTRAP_ENABLED=false` and remove the
temporary bootstrap credentials. Demo account and quiz seeding is disabled by default and must
not be enabled in production.

## Deployment boundary

This repository is prepared to build production containers and run the backend with external
configuration and versioned schema migrations. No Azure resources have been created and no
subscription, region, registry, database, or Container Apps environment has been selected.
Those infrastructure choices and deployment permissions are still needed before provisioning
or publishing the application.

## Main API routes

- Authentication: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Quizzes: `GET /api/quizzes`, `GET /api/quizzes/{id}/start`,
  `POST /api/quizzes/{id}/submit`
- AI authoring: `POST /api/ai/upload-pyq-pdf`, `POST /api/ai/generate-quiz`
- Admin: `/api/admin/**`
- Health: `/actuator/health`
