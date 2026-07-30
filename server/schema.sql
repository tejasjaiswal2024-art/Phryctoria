-- Phryctoria PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'FATAL', 'DEBUG')),
    message TEXT NOT NULL,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    http_status INTEGER NOT NULL DEFAULT 200,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(150) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('500_error_count', 'p95_latency_ms', 'p99_latency_ms')),
    threshold_value INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL DEFAULT 60,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES alert_rules(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Acknowledged', 'Resolved')),
    message TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indices for high-throughput query performance
CREATE INDEX IF NOT EXISTS idx_telemetry_service_time ON telemetry_logs (service_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_level ON telemetry_logs (level);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
