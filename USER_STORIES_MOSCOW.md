# Phryctoria - 25 Agile User Stories & MoSCoW Prioritization

This document contains **25 structured Agile User Stories** for **Phryctoria (Distributed Log Aggregator & Alerting Engine)**, categorized using the **MoSCoW framework** (`Must Have`, `Should Have`, `Could Have`, `Won't Have`), ready to import into GitHub Issues and GitHub Projects for Digital Assignment 1.

---

## Must Have (Core MVP & Ingestion Architecture)

### US-01: HTTP & gRPC Telemetry Ingestion Endpoint
- **As a** Microservice Developer  
- **I want to** transmit log and metric JSON payloads to the Phryctoria ingestion API via HTTP REST or gRPC  
- **So that** application logs from isolated microservices are centrally collected.  
- **Acceptance Criteria**: `POST /api/v1/telemetry/ingest` accepts JSON payloads containing `service_name`, `level`, `message`, `latency_ms`, and `timestamp`.

### US-02: Asynchronous Redis Message Buffering
- **As a** DevOps Engineer  
- **I want** incoming telemetry logs to be buffered asynchronously in a Redis queue  
- **So that** high-throughput traffic spikes do not drop data or overload the database.  
- **Acceptance Criteria**: Ingested payloads are immediately pushed to Redis queue with zero data loss under simulated load.

### US-03: Real-Time Live Log Stream Console
- **As a** Software Engineer  
- **I want to** view a real-time live stream of incoming logs on the web dashboard  
- **So that** I can monitor application behavior and debug live issues as they occur.  
- **Acceptance Criteria**: Dashboard updates live log entries with severity badges (`INFO`, `WARN`, `ERROR`).

### US-04: Calculate Latency Percentiles ($p50$, $p95$, $p99$)
- **As an** SRE  
- **I want** the system to compute dynamic response time percentiles ($p50$, $p95$, $p99$) across sliding time windows  
- **So that** latency degradation and long-tail performance outliers are surfaced.  
- **Acceptance Criteria**: API endpoint `/api/v1/analytics/percentiles` returns exact $p50$, $p95$, and $p99$ values in milliseconds.

### US-05: Automated Threshold Alert Rule Engine
- **As an** On-Call Engineer  
- **I want to** define threshold alert rules (e.g., "Alert if 500-level error count > 10 in 60s" or "$p99$ latency > 500ms")  
- **So that** incident notifications are triggered automatically without manual monitoring.  
- **Acceptance Criteria**: Background stream worker evaluates rules continuously and creates incident alerts upon breach.

### US-06: View Active & Historical Incidents Log
- **As an** IT Manager  
- **I want to** view a central incident feed listing all active and resolved alert events  
- **So that** service outages and resolution times are fully auditable.  
- **Acceptance Criteria**: Incident panel displays trigger time, threshold rule breached, affected service, and current status.

### US-07: Filterable Log Search by Service & Severity
- **As a** Developer  
- **I want to** filter log streams by service name (`auth-service`, `payment-api`) and log level (`ERROR`, `WARN`)  
- **So that** I can isolate specific failure patterns quickly.  
- **Acceptance Criteria**: Search bar and dropdown filters update table rows dynamically.

### US-08: Multi-Container Docker Compose Deployment
- **As a** Systems Administrator  
- **I want to** deploy the entire stack (`client`, `server`, `worker`, `postgres`, `redis`) via Docker Compose  
- **So that** local development and production deployments are fully isolated and reproducible.  
- **Acceptance Criteria**: `docker-compose up --build` launches all 5 containers with complete networking inter-connectivity.

---

## Should Have (Observability & Operational Enhancements)

### US-09: Latency Percentile Visual Breakdown Charts
- **As an** SRE  
- **I want** visual chart indicators comparing $p50$, $p95$, and $p99$ latency values  
- **So that** tail-latency anomalies stand out visually against normal operations.  
- **Acceptance Criteria**: Percentile bar charts display clear color-coded indicators for $p50$ (green), $p95$ (amber), and $p99$ (red).

### US-10: Ingestion Health Check Endpoint
- **As a** Container Orchestrator (Docker/Kubernetes)  
- **I want** a `/api/v1/health` endpoint returning system uptime and buffer queue depth  
- **So that** container readiness and liveness probes can evaluate health.  
- **Acceptance Criteria**: Health endpoint returns HTTP 200 with queue size and status payload.

### US-11: Structured Exception Stack Trace Viewer
- **As a** Backend Engineer  
- **I want to** click a log entry to expand and view the full formatted stack trace  
- **So that** I can diagnose code exceptions without accessing raw log files.  
- **Acceptance Criteria**: Log row expands to show structured JSON payload and stack trace formatted in monospaced font.

### US-12: Configurable Rule Builder Modal
- **As an** Administrator  
- **I want a** UI modal to create and toggle alert threshold rules  
- **So that** I can adjust monitoring sensitivity without editing configuration files.  
- **Acceptance Criteria**: Rule builder modal allows setting target service, metric condition, threshold value, and time window.

### US-13: Ingestion API Key Authentication
- **As a** Security Lead  
- **I want** microservice telemetry requests to include an API key header (`X-Phryctoria-Key`)  
- **So that** unauthorized data cannot be injected into the aggregator.  
- **Acceptance Criteria**: Unauthenticated ingestion requests are rejected with HTTP 401 Unauthorized.

### US-14: Graceful Storage Fallback Engine
- **As a** Developer  
- **I want** the API server to operate seamlessly in standalone mode if Redis or PostgreSQL containers are starting up  
- **So that** local developer testing remains frictionless.  
- **Acceptance Criteria**: Server falls back gracefully to in-memory ring buffers when external containers are initializing.

---

## Could Have (Advanced Analytics & Integrations)

### US-15: Slack & Discord Incident Webhook Alerts
- **As a** Team Member  
- **I want** active incident alerts to be dispatched automatically to a Slack or Discord webhook channel  
- **So that** on-call engineers receive immediate push notifications.

### US-16: Log Payload Export to JSON / CSV
- **As an** Auditor  
- **I want to** export filtered log query results to a CSV or JSON file  
- **So that** compliance evidence can be saved for offline analysis.

### US-17: Distributed Request Tracing ID Correlation
- **As an** SRE  
- **I want** log entries to correlate with a global `trace_id` across multiple microservices  
- **So that** an entire multi-step request path can be reconstructed.

### US-18: Customizable Dashboard Layout & Dark Mode
- **As a** User  
- **I want to** customize dashboard card positions and toggle dark/light mode themes  
- **So that** the interface adapts to personal workflow preferences.

### US-19: Historical Percentile Trend Range Selector
- **As an** Analyst  
- **I want to** select custom time ranges (Last 15m, 1h, 24h, 7d) for $p50$, $p95$, $p99$ trends  
- **So that** long-term performance degradation can be tracked over weeks.

### US-20: Rate Limiting on Ingestion API
- **As a** Platform Engineer  
- **I want** to rate-limit incoming telemetry requests per API key  
- **So that** rogue microservice loops do not exhaust system memory.

### US-21: Log Retention Auto-Pruning Policy
- **As a** System Administrator  
- **I want** logs older than 30 days to be automatically pruned from PostgreSQL  
- **So that** database storage costs remain controlled.

---

## Won't Have (Out of Scope for Review 1)

### US-22: AI-Powered Anomaly Detection Engine
- **As an** SRE  
- **I want** machine learning models to detect unknown anomaly patterns automatically without fixed rules. *(Deferred to future release)*.

### US-23: Multi-Tenant Enterprise RBAC Authorization
- **As an** Enterprise Manager  
- **I want** fine-grained organization permissions and SAML SSO integration. *(Deferred to future release)*.

### US-24: Full eBPF Kernel-Level Packet Inspection
- **As a** Security Architect  
- **I want** eBPF kernel probes for zero-code telemetry extraction. *(Deferred to future release)*.

### US-25: Built-in SaaS Subscription Billing Module
- **As a** SaaS Founder  
- **I want** automated Stripe subscription management per log volume gigabyte. *(Deferred to future release)*.
