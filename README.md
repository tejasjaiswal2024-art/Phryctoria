# Vision Document: OmniLog (Distributed Log Aggregator & Alerting Engine)

## Project Name & Overview
**Project Name:** OmniLog
**Overview:** OmniLog is a high-performance, cloud-native observability platform designed to act as a lightweight, deployable alternative to enterprise telemetry solutions like Datadog or AWS CloudWatch. The system operates as a centralized telemetry ingestion pipeline, allowing external microservices to securely transmit log and metric payloads via HTTP or gRPC. OmniLog indexes these logs in real-time, calculates critical performance percentiles ($p50$, $p95$, $p99$), and utilizes an automated alerting engine to notify teams when specific error thresholds are breached.

## Problem it Solves
In modern, decentralized microservice architectures, telemetry data is highly fragmented. Engineering teams frequently suffer from "observability blind spots," struggling to trace request flows or identify performance bottlenecks across isolated containers. Furthermore, without automated alerting, critical system failures often go unnoticed until reported by end-users. OmniLog eliminates this fragmentation by providing a single, unified source of truth, drastically reducing the Mean Time To Recovery (MTTR) for system incidents.

## Target Users (Personas)
* **Site Reliability Engineers (SREs):** Require high-level, aggregate dashboards to monitor overall system health, track latency metrics, and configure automated incident routing for on-call rotations.
* **Backend Software Engineers:** Need an intuitive, real-time interface to query specific log streams, trace microservice interactions, and debug application-level errors efficiently.
* **System Administrators:** Responsible for infrastructure security, managing API access keys, configuring role-based access control (RBAC), and auditing system-wide alert rules.

## Vision Statement
To empower software engineering teams with a fast, lightweight, and easily deployable observability platform that transforms raw, decentralized telemetry data into actionable, real-time insights, ensuring proactive incident response and maximum system reliability.

## Key Features & Goals
* **High-Throughput Telemetry Ingestion:** Securely process high-volume log and metric payloads from decentralized microservices using REST HTTP and gRPC protocols.
* **Asynchronous Data Processing:** Buffer incoming telemetry through a message queue (e.g., Redis) to ensure zero data loss during high-traffic spikes or database outages.
* **Live Observability Dashboard:** Provide a filterable, real-time stream of incoming log entries alongside dynamic visualizations of system latency percentiles (p50, p95, p99).
* **Automated Alerting Engine:** Enable users to define custom, threshold-based alert rules (e.g., "Trigger notification if 500-level HTTP errors > 10 within 60 seconds") to automate incident awareness.

## Success Metrics
* **Ingestion Fault Tolerance:** The system must successfully queue and process 100% of incoming log payloads without dropping data during simulated traffic spikes.
* **Query & Rendering Latency:** Dashboard visualizations and indexed log search results must load and render in under 2 seconds.
* **Alert Responsiveness:** The alerting engine must evaluate threshold rules and dispatch notifications within 5 seconds of a system anomaly occurring.

## Assumptions & Constraints
* **Assumptions:** Client applications are correctly configured to format and push their telemetry outputs into the standardized JSON payload structure required by the OmniLog ingestion API.
* **Constraints:** For the scope of this project and local development requirements, the distributed architecture will be constrained to the resource limits of the host machine utilizing a unified `docker-compose.yml` network environment.
