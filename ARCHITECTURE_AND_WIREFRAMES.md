# Phryctoria - Architecture Diagram Spec & 6 Figma Screen Wireframes

This document provides complete specifications for the **Draw.io Landscape Architecture Diagram** and the **6 Figma UI Wireframe Screens** required for **Digital Assignment 1 / Review 1** for **Phryctoria: Distributed Log Aggregator & Alerting Engine**.

---

## 1. Draw.io Architecture Diagram Specification

### Format Requirements
- **Orientation:** Landscape
- **Structure:** Left-to-Right component data flow map showing microservices ingestion → Redis buffer → Worker stream processor → DB/Cache → React Observability UI.

### Component Map & Data Flow
```text
[ External Microservices / Apps ]
  (Auth Service, Payment Gateway, Order API, Database Cluster)
        │
        ▼ (HTTP REST / gRPC Telemetry Payloads on :5000)
┌────────────────────────────────────────────────────────────────────────┐
│  TELEMETRY INGESTION API LAYER (Express API Container - phryctoria-server)│
│  • POST /api/v1/telemetry/ingest  • GET /api/v1/logs                   │
│  • GET /api/v1/analytics/percentiles (p50, p95, p99)                  │
└────────────────────────────────────────────────────────────────────────┘
        │                               ▲
        ▼ (Enqueue Raw Logs)            │ (Query Log & Percentile Analytics)
┌──────────────────────────────┐  ┌──────────────────────────────────────┐
│  REDIS MESSAGE BUFFER        │  │ FRONTEND OBSERVABILITY UI            │
│  (phryctoria-redis - :6379)  │  │ (React Client Container - :3000)     │
│  • Ingestion Queue Buffer    │  │ • Live Log Stream Console            │
│  • Telemetry Rate Limiter    │  │ • p50, p95, p99 Latency Visualizer   │
└──────────────────────────────┘  │ • Alert Rule Builder & Incident Feed │
        │                         └──────────────────────────────────────┘
        ▼ (Pop & Stream Process Logs)
┌────────────────────────────────────────────────────────────────────────┐
│  STREAM PROCESSING WORKER CONTAINER (phryctoria-worker)                │
│  • Sliding Window p50, p95, p99 Percentile Calculator                  │
│  • Automated Threshold Rule Evaluator (Error Count & Latency Breaches) │
└────────────────────────────────────────────────────────────────────────┘
        │
        ▼ (Persist Indexed Logs & Incidents)
┌────────────────────────────────────────────────────────────────────────┐
│  POSTGRESQL DATABASE CONTAINER (phryctoria-postgres - :5432)          │
│  • Indexed Telemetry Logs Table  • Alert Rules Table • Incidents Table │
└────────────────────────────────────────────────────────────────────────┘
```

### Legend / Key
- 🔵 **Blue Arrows**: HTTP/gRPC Telemetry Ingestion Flow
- 🟢 **Green Arrows**: Asynchronous Redis Queue Buffering & Stream Worker Draining
- 🟣 **Purple Blocks**: Docker Compose Isolated Container Boundaries (`phryctoria-network`)

---

## 2. Figma Wireframe Specifications (6 Required Screens)

### Screen 1: Executive Telemetry Overview & Latency Percentiles Dashboard
- **Header**: Logo, System Title ("Phryctoria Log Aggregator"), System Status Badge ("Processing 1,240 logs/sec"), Add Rule button.
- **Top Metric Cards**: 4 Cards displaying Total Ingested Logs, $p50$ Median Latency (ms), $p95$ Latency (ms), and $p99$ Tail Latency (ms).
- **Main View**: Real-time summary of active microservices, log throughput, and current active incident alerts.

### Screen 2: Live Log Stream & Filterable Query Search Console
- **Header**: Search Query input (`"500 Internal Server Error"`), Service Filter dropdown (`All`, `auth-service`, `payment-api`), Log Level selector (`INFO`, `WARN`, `ERROR`).
- **Live Stream Table**: Real-time table streaming incoming log records with columns for Timestamp, Severity Level Badge, Service Source, HTTP Code, Latency (ms), and Log Message text.

### Screen 3: Latency Percentile Analytics Detail ($p50$, $p95$, $p99$ Trends)
- **Header**: Service Selector dropdown, Time Window Selector (`Last 15m`, `1h`, `24h`).
- **Analytics Charts**: Visual latency percentile distribution charts displaying $p50$ (median operational speed), $p95$ (95th percentile latency), and $p99$ (99th percentile tail latency spikes).

### Screen 4: Automated Alert Rule Builder Modal
- **Overlay Window**: Centered modal with semi-transparent background backdrop.
- **Form Controls**:
  - Rule Title / Description
  - Target Microservice selection
  - Metric Condition (`500-level Error Count`, `$p99$ Latency (ms)`, `$p95$ Latency (ms)`)
  - Threshold Value (e.g. `10 errors` or `500 ms`)
  - Evaluation Window (`60 seconds`, `5 minutes`)
- **Footer Buttons**: `Cancel` (ghost button) and `Save Alert Rule` (gradient primary button).

### Screen 5: Active Incidents & Alert Trigger History Log
- **Header**: Active Incident Feed title, Unresolved Incidents count badge, filter by status (`Active` vs `Resolved`).
- **Incident Cards**: Chronological alert cards displaying breached rule title, affected microservice, breach timestamp, threshold details, and resolution actions.

### Screen 6: Ingestion API Keys & System Settings Screen
- **Settings Form**: Ingestion API Key management, Redis buffer queue status indicators, PostgreSQL database storage utilization, and log retention pruning configuration.
