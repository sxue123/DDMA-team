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

### 1. Clone the Repository and Open in IntelliJ

**Clone via terminal:**

```bash
git clone https://github.com/qhuang258/DDMA-team.git
```

**Open as a Gradle project in IntelliJ:**

1. Launch IntelliJ IDEA.
2. On the Welcome screen, click **Open**.
3. Navigate into the cloned folder, go to `backend/DeliveryManagement/`, and **select `build.gradle`** (not the folder).
4. Click **Open**, then choose **Open as Project** when prompted.
5. IntelliJ will import the Gradle project and download dependencies automatically. Wait for the bottom status bar to finish syncing.

> **Note:** Always open via `build.gradle`, not the root folder. Opening the folder directly may cause IntelliJ to treat it as a plain directory and skip Gradle recognition.

### 2. Start the Database

Navigate to the directory containing `docker-compose.yml` (the project root) and run:

```bash
docker-compose up -d
```

### 3. Test the Database Connection in IntelliJ

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

After completing all 3 steps, you can run the project in IntelliJ by clicking the green **Run** button (or `Shift+F10`) on the main application class.

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

## Task 3 Verification

Task 3 adds DTO classes, database-backed Service classes, and a `DevRunner` that verifies the `DTO + Service + database` chain in the `dev` profile.

Files added for this task live under:

- `backend/DeliveryManagement/src/main/java/com/laioffer/deliverymanagement/dto/`
- `backend/DeliveryManagement/src/main/java/com/laioffer/deliverymanagement/service/`
- `backend/DeliveryManagement/src/main/java/com/laioffer/deliverymanagement/DevRunner.java`

Run the verification with:

```bash
cd backend/DeliveryManagement
./gradlew bootRun --args="--spring.profiles.active=dev --spring.main.web-application-type=none"
```

What it checks on startup:

1. Each MVP table can be queried through its Service.
2. Each query can be mapped into the corresponding DTO.
3. Basic table relationships can be read successfully, such as:
   - user -> otp_challenge
   - user -> orders
   - delivery_center -> fleet_vehicle
   - order -> order_parcel
   - order -> payment

Expected prerequisite:

- The local PostgreSQL instance must accept the credentials configured in
  `backend/DeliveryManagement/src/main/resources/application.properties`,
  or you must override them with `DATABASE_URL`, `DATABASE_PORT`,
  `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.
