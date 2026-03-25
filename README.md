# Autonomous Delivery App（自治配送）

本仓库包含产品/冲刺规划文档、**Java Spring Boot 后端**脚手架与 **Web 前端** 工程。

- **后端（Gradle / Spring Boot）**：[`backend/DeliveryManagement/`](backend/DeliveryManagement/)（详见模块内 `HELP.md`）。
- **前端开发与运行说明**（环境、`npm ci`、脚本、目录结构）：请阅读 [frontend/README.md](frontend/README.md)。
- **当前冲刺执行清单**：[`docs/Sprint0/Sprint0Backlog.md`](docs/Sprint0/Sprint0Backlog.md)（含进度与 Sprint 0 末并行轨）
- **UI 待办与前端架构**：[UIBacklog.md](UIBacklog.md)
- **产品待办**：[ProductBacklog.md](ProductBacklog.md)
- **冲刺计划**：[SprintReleasePlan.md](SprintReleasePlan.md)
- **后端与数据层技术选型讨论**：[BackendTechStackDiscussion.md](BackendTechStackDiscussion.md)
- **Java 后端分层架构与数据库 ER**：[JavaBackendArchitecture.md](JavaBackendArchitecture.md)

## PostgreSQL Installation (for Development)

### 1. Create a New Project in IntelliJ

Select **Spring Boot** in the Generators section and fill in:

| Field | Value |
|---|---|
| Project Name | `ddma` |
| Language | Java |
| Type | Gradle - Groovy |
| Group | `com.laioffer` |
| Package | `com.laioffer.ddma` |
| JDK | Eclipse Temurin 21 / Java 21 |

### 2. Rename `src/main/resources/application.properties` to `src/main/resources/application.yml`

Replace the contents with:

```yaml
spring:
  jackson:
    default-property-inclusion: non_null
    property-naming-strategy: SNAKE_CASE
  datasource:
    url: jdbc:postgresql://${DATABASE_URL:localhost}:${DATABASE_PORT:5432}/ddma
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:secret}
    driver-class-name: org.postgresql.Driver
  sql:
    init:
      mode: ${INIT_DB:always}
      schema-locations: "classpath:database-init.sql"

logging:
  level:
    org.apache.coyote.http11.Http11InputBuffer: TRACE  # Incoming HTTP requests
    org.springframework.jdbc.datasource.init: DEBUG
```

### 3. Create `src/main/resources/database-init.sql`

Place the file under `src/main/resources/`. The full schema and seed data are in [`docs/project_backlog/database-init.sql`](docs/project_backlog/database-init.sql).

Tables created (in dependency order):

1. `app_user`
2. `otp_challenge`
3. `delivery_center`
4. `fleet_vehicle`
5. `orders`
6. `order_parcel`
7. `payment`

### 4. Update `build.gradle`

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.0.4'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.laioffer'
version = '0.0.1-SNAPSHOT'
description = 'ddma'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jdbc'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    runtimeOnly 'org.postgresql:postgresql:42.7.7'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

### 5. Create `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:15.2-alpine
    environment:
      POSTGRES_DB: ddma
      POSTGRES_PASSWORD: secret
    volumes:
      - ddma-pg-local:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  ddma-pg-local:
```

Start the database:

```bash
docker-compose up -d
```

### 6. Test the Database Connection in IntelliJ

**Connect via the Database panel**

1. Open **View → Tool Windows → Database** (or click the **Database** tab on the right sidebar).
2. Click **+** → **Data Source** → **PostgreSQL**.
3. Fill in the connection details:

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `ddma` |
| User | `postgres` |
| Password | `secret` |

4. Click **Test Connection** — IntelliJ may prompt you to download the PostgreSQL driver; click **Download**.
5. Click **OK** to save.

**Verify tables and seed data**

Once connected, open a query console (**Right-click the data source → New → Query Console**) and run:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify seed data
SELECT id, email, full_name, guest FROM app_user;
SELECT id, name, address_line  FROM delivery_center;
SELECT id, vehicle_type, available, external_device_id FROM fleet_vehicle;
SELECT id, status, total_amount, currency FROM orders;
```

You should see 4 users, 3 delivery centers, 9 fleet vehicles, and 4 orders returned.

**Option 2 — psql via Docker**

First, find your container name:

```bash
docker ps
```

Look at the **NAMES** column (typically `<project-folder>-db-1`, e.g. `ddma-db-1`). Then connect:

```bash
docker exec -it ddma-db-1 psql -U postgres -d ddma
```

Once inside, useful commands:

```sql
\dt                  -- list all tables
\d app_user          -- describe a table's columns
\q                   -- quit
```

Sample SELECT queries:

```sql
-- All users
SELECT id, email, full_name, guest FROM app_user;

-- All delivery centers
SELECT id, name, address_line FROM delivery_center;

-- Available vehicles grouped by center
SELECT dc.name AS center, fv.vehicle_type, COUNT(*) AS available_count
FROM fleet_vehicle fv
JOIN delivery_center dc ON dc.id = fv.center_id
WHERE fv.available = TRUE
GROUP BY dc.name, fv.vehicle_type
ORDER BY dc.name, fv.vehicle_type;

-- All orders with user name and center
SELECT o.id, u.full_name, dc.name AS center, o.status,
       o.vehicle_type_chosen, o.total_amount, o.currency
FROM orders o
LEFT JOIN app_user u ON u.id = o.user_id
JOIN delivery_center dc ON dc.id = o.center_id
ORDER BY o.created_at DESC;

-- Orders with parcel details
SELECT o.id AS order_id, o.status, op.size_tier,
       op.weight_kg, op.fragile, op.delivery_notes
FROM orders o
JOIN order_parcel op ON op.order_id = o.id;

-- Payment status per order
SELECT o.id AS order_id, u.full_name, p.status AS payment_status,
       p.amount, p.stripe_payment_intent_id
FROM payment p
JOIN orders o ON o.id = p.order_id
LEFT JOIN app_user u ON u.id = o.user_id;

-- In-transit orders with simulated vehicle position
SELECT id, pickup_summary, dropoff_summary,
       sim_latitude, sim_longitude, sim_heading_deg, sim_updated_at
FROM orders
WHERE status = 'IN_TRANSIT';
```
