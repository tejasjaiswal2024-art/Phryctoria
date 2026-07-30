# Phryctoria: Distributed Log Aggregator & Alerting Engine

## 1. Vision Document

### Project Name & Overview
**Project Name:** Phryctoria  
**Overview:** Phryctoria is a high-performance, cloud-native observability platform and distributed log aggregator designed to act as a lightweight, deployable telemetry engine for modern microservice architectures. The system operates as a centralized telemetry ingestion pipeline, allowing external microservices to securely transmit log and metric payloads via HTTP or gRPC. Phryctoria indexes these logs in real-time, calculates critical performance percentiles ($p50$, $p95$, $p99$), buffers incoming data asynchronously via Redis, and utilizes an automated alerting engine to notify teams when specific error or latency thresholds are breached.

### Problem it Solves
In modern, decentralized microservice architectures, telemetry data is highly fragmented. Engineering teams frequently suffer from "observability blind spots," struggling to trace request flows or identify performance bottlenecks across isolated containers. Furthermore, without automated alerting based on latency percentiles ($p95$, $p99$), critical system degradations often go unnoticed until reported by end-users. Phryctoria eliminates this fragmentation by providing a single, unified source of truth, drastically reducing the Mean Time To Recovery (MTTR) for system incidents.

### Target Users (Personas)
1. **Site Reliability Engineers (SREs):** Require high-level, aggregate dashboards to monitor overall system health, track latency percentiles ($p50$, $p95$, $p99$), and configure automated incident routing for on-call rotations.
2. **Backend Software Engineers:** Need an intuitive, real-time interface to query specific log streams, trace microservice interactions, filter by severity (`INFO`, `WARN`, `ERROR`), and debug application-level errors efficiently.
3. **System Administrators:** Responsible for infrastructure security, managing API ingestion keys, configuring role-based access control (RBAC), and auditing system-wide alert rules.

### Vision Statement
To empower software engineering teams with a fast, lightweight, and easily deployable observability platform that transforms raw, decentralized telemetry data into actionable, real-time insights, ensuring proactive incident response and maximum system reliability.

### Key Features & Goals
* **High-Throughput Telemetry Ingestion:** Securely process high-volume log and metric payloads from decentralized microservices using REST HTTP and gRPC protocols.
* **Asynchronous Data Processing & Redis Buffering:** Buffer incoming telemetry through a message queue (Redis) to ensure zero data loss during high-traffic spikes or database outages.
* **Live Observability Dashboard:** Provide a filterable, real-time stream of incoming log entries alongside dynamic visualizations of system latency percentiles ($p50$, $p95$, $p99$).
* **Automated Threshold Alerting Engine:** Enable users to define custom, threshold-based alert rules (e.g., "Trigger notification if 500-level HTTP errors > 10 within 60 seconds" or "$p99$ latency > 500ms") to automate incident awareness.

### Success Metrics
* **Ingestion Fault Tolerance:** The system must successfully queue and process 100% of incoming log payloads without dropping data during simulated traffic spikes.
* **Query & Rendering Latency:** Dashboard visualizations and indexed log search results must load and render in under 2 seconds ($p99$ query latency < 2s).
* **Alert Responsiveness:** The alerting engine must evaluate threshold rules and dispatch notifications within 5 seconds of a system anomaly occurring.

### Assumptions & Constraints
* **Assumptions:** Client microservices are configured to push telemetry payloads in standardized JSON structure into the Phryctoria ingestion API endpoint (`/api/v1/telemetry/ingest`).
* **Constraints:** For the scope of local development and Digital Assignment 1, the distributed architecture is fully containerized within a unified `docker-compose.yml` network environment.

---

## 2. Tech Stack Overview

* **Frontend UI:** React for a responsive, component-driven observability console with real-time log streaming and percentile visualization.
* **Backend Ingestion API:** Node.js with Express for REST HTTP telemetry ingestion, log queries, percentile analytics calculation, and alert management.
* **Stream Worker Microservice:** Node.js service dedicated to draining Redis message buffers, calculating sliding window $p50$, $p95$, $p99$ metrics, and triggering alerts.
* **Database:** PostgreSQL for persistent storage of indexed log records, alert rules, and incident logs.
* **Cache / Message Queue:** Redis for fast-access log buffering, queueing ingestion tasks, and caching latency percentile statistics.
* **Containerization:** Docker & Docker Compose orchestrating all 5 microservices in isolated container environments.

---

## 3. Repository Organization

The repository is structured as a monorepo containing distinct microservices:

```text
Phryctoria/
├── client/                 # React frontend application & Dockerfile
│   ├── src/
│   ├── index.html
│   └── Dockerfile
├── server/                 # Node.js Express backend API & Dockerfile
│   ├── src/
│   └── Dockerfile
├── worker/                 # Stream processing worker service & Dockerfile
│   ├── src/
│   └── Dockerfile
├── USER_STORIES_MOSCOW.md  # 25 Agile User Stories with MoSCoW tags
├── ARCHITECTURE_AND_WIREFRAMES.md # Draw.io Diagram Spec & 6 Figma Wireframe Blueprints
├── .gitignore              # Root gitignore (credentials & doc safety)
├── docker-compose.yml      # Multi-container orchestration
└── README.md               # Vision document & assignment documentation
```

---

## 4. Branching Strategy (GitHub Flow)

We utilize the **GitHub Flow** strategy for collaborative development:
1. `main` branch: The single source of truth. Always deployable and reflects current production-ready state.
2. **Feature branches**: Created off `main` for all new work (e.g., `feature/add-redis-cache`, `bugfix/fix-percentile-calculation`).
3. **Pull Requests (PRs)**: Once a feature is complete, a PR is opened against `main` for code review.
4. **Merge**: After review and successful local testing, the branch is merged into `main` and deleted.

---

## 5. Quick Start – Local Development with Docker

To run the entire Phryctoria stack locally in Docker containers, ensure you have **Docker Desktop** installed and running.

### 1. Clone the Repository & Navigate
```bash
git clone <your-repo-url>
cd Phryctoria
```

### 2. Build and Start the Containers
Use Docker Compose to spin up all 5 containers (Frontend, Ingestion API, Stream Worker, PostgreSQL database, and Redis queue) simultaneously:

```bash
docker-compose up --build
```

### 3. Access the Application
* **Frontend Observability Console:** [http://localhost:3000](http://localhost:3000)
* **Backend Ingestion API:** [http://localhost:5000](http://localhost:5000)
* **PostgreSQL (internal):** `localhost:5432`
* **Redis Queue (internal):** `localhost:6379`

### 4. Stopping the Environment
```bash
docker-compose down
```

---

## 6. Local Development Tools

* **Docker Desktop:** Core containerization engine.
* **Draw.io:** Used for architecture diagrams.
* **Figma:** Used for UI wireframing and prototyping.
* **Postman / Insomnia:** Used for testing ingestion API endpoints.
* **VS Code:** Primary IDE.
