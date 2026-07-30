const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-Memory Telemetry Buffer & Data Store
let telemetryLogs = [
  { id: "log-101", service: "auth-service", level: "INFO", message: "User authentication successful for UID 9842", latency_ms: 45, http_status: 200, timestamp: new Date(Date.now() - 150000).toISOString() },
  { id: "log-102", service: "payment-gateway", level: "WARN", message: "Stripe API latency threshold exceeded", latency_ms: 820, http_status: 200, timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: "log-103", service: "order-api", level: "INFO", message: "Order #8491 created successfully", latency_ms: 110, http_status: 201, timestamp: new Date(Date.now() - 90000).toISOString() },
  { id: "log-104", service: "search-indexer", level: "ERROR", message: "Elasticsearch connection timeout on query index 'products'", latency_ms: 2450, http_status: 504, timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: "log-105", service: "auth-service", level: "INFO", message: "Token refreshed for session 'sess-771'", latency_ms: 38, http_status: 200, timestamp: new Date(Date.now() - 45000).toISOString() },
  { id: "log-106", service: "payment-gateway", level: "ERROR", message: "Card transaction declined: HTTP 500 Internal Gateway Error", latency_ms: 1250, http_status: 500, timestamp: new Date(Date.now() - 30000).toISOString() },
  { id: "log-107", service: "order-api", level: "WARN", message: "Inventory cache miss for Item SKU-1092", latency_ms: 410, http_status: 200, timestamp: new Date(Date.now() - 15000).toISOString() },
  { id: "log-108", service: "search-indexer", level: "ERROR", message: "Fatal index memory breach: HTTP 500 Internal Server Error", latency_ms: 3100, http_status: 500, timestamp: new Date(Date.now() - 5000).toISOString() }
];

let alertRules = [
  { id: "rule-1", name: "High HTTP 500 Error Breach", service: "search-indexer", metric: "500_error_count", threshold: 2, window_seconds: 60, enabled: true },
  { id: "rule-2", name: "p99 Tail Latency Warning (>500ms)", service: "payment-gateway", metric: "p99_latency_ms", threshold: 500, window_seconds: 60, enabled: true }
];

let activeIncidents = [
  {
    id: "inc-501",
    ruleId: "rule-1",
    service: "search-indexer",
    type: "Critical Error Threshold Breached",
    status: "Active",
    startedAt: new Date(Date.now() - 300000).toISOString(),
    message: "search-indexer triggered 2 consecutive HTTP 500 errors within 60s window."
  },
  {
    id: "inc-502",
    ruleId: "rule-2",
    service: "payment-gateway",
    type: "p99 Latency Degradation Warning",
    status: "Active",
    startedAt: new Date(Date.now() - 180000).toISOString(),
    message: "payment-gateway p99 latency reached 1250ms (threshold: 500ms)."
  }
];

// Helper: Calculate Percentiles (p50, p95, p99)
function calculatePercentiles(latencies) {
  if (!latencies || latencies.length === 0) return { p50: 0, p95: 0, p99: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const getPercentile = (p) => {
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  };
  return {
    p50: getPercentile(50),
    p95: getPercentile(95),
    p99: getPercentile(99)
  };
}

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'phryctoria-ingestion-api',
    uptime: process.uptime(),
    buffer_depth: telemetryLogs.length,
    timestamp: new Date().toISOString()
  });
});

// Telemetry Payload Ingestion Endpoint
app.post('/api/v1/telemetry/ingest', (req, res) => {
  const { service, level, message, latency_ms, http_status } = req.body;
  if (!service || !message) {
    return res.status(400).json({ success: false, message: "service and message fields are required." });
  }

  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    service,
    level: level ? level.toUpperCase() : "INFO",
    message,
    latency_ms: parseInt(latency_ms) || 50,
    http_status: parseInt(http_status) || 200,
    timestamp: new Date().toISOString()
  };

  telemetryLogs.unshift(logEntry);
  if (telemetryLogs.length > 1000) telemetryLogs.pop();

  res.status(201).json({ success: true, message: "Telemetry payload enqueued successfully.", log: logEntry });
});

// Query Logs with Filtering & Search
app.get('/api/v1/logs', (req, res) => {
  const { service, level, search, limit } = req.query;
  let filtered = [...telemetryLogs];

  if (service && service !== 'All') {
    filtered = filtered.filter(l => l.service.toLowerCase() === service.toLowerCase());
  }

  if (level && level !== 'All') {
    filtered = filtered.filter(l => l.level.toUpperCase() === level.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l => l.message.toLowerCase().includes(q) || l.service.toLowerCase().includes(q));
  }

  const maxLimit = parseInt(limit) || 100;
  res.json({ success: true, count: filtered.length, total: telemetryLogs.length, data: filtered.slice(0, maxLimit) });
});

// Calculate Real-Time Latency Percentiles (p50, p95, p99)
app.get('/api/v1/analytics/percentiles', (req, res) => {
  const { service } = req.query;
  let logsToAnalyze = telemetryLogs;

  if (service && service !== 'All') {
    logsToAnalyze = telemetryLogs.filter(l => l.service.toLowerCase() === service.toLowerCase());
  }

  const latencies = logsToAnalyze.map(l => l.latency_ms).filter(n => typeof n === 'number' && !isNaN(n));
  const percentiles = calculatePercentiles(latencies);

  res.json({
    success: true,
    service: service || 'Global System Wide',
    sample_size: latencies.length,
    percentiles: {
      p50_ms: percentiles.p50,
      p95_ms: percentiles.p95,
      p99_ms: percentiles.p99
    }
  });
});

// Alerts & Incidents
app.get('/api/v1/alerts', (req, res) => {
  res.json({
    success: true,
    rules: alertRules,
    incidents: activeIncidents
  });
});

app.post('/api/v1/alerts/rules', (req, res) => {
  const { name, service, metric, threshold, window_seconds } = req.body;
  if (!name || !service) {
    return res.status(400).json({ success: false, message: "Rule name and target service are required." });
  }

  const newRule = {
    id: `rule-${Date.now()}`,
    name,
    service,
    metric: metric || "500_error_count",
    threshold: parseInt(threshold) || 5,
    window_seconds: parseInt(window_seconds) || 60,
    enabled: true
  };

  alertRules.push(newRule);
  res.status(201).json({ success: true, data: newRule });
});

// Worker Telemetry Ingestion Endpoint
app.post('/api/v1/worker/evaluate', (req, res) => {
  const latencies = telemetryLogs.map(l => l.latency_ms);
  const percentiles = calculatePercentiles(latencies);

  // Evaluate rules
  alertRules.forEach(rule => {
    if (!rule.enabled) return;
    const serviceLogs = telemetryLogs.filter(l => l.service === rule.service);
    const errorCount = serviceLogs.filter(l => l.http_status >= 500).length;

    if (rule.metric === "500_error_count" && errorCount >= rule.threshold) {
      const existing = activeIncidents.find(i => i.ruleId === rule.id && i.status === "Active");
      if (!existing) {
        activeIncidents.unshift({
          id: `inc-${Date.now()}`,
          ruleId: rule.id,
          service: rule.service,
          type: "Threshold Error Breach",
          status: "Active",
          startedAt: new Date().toISOString(),
          message: `${rule.service} exceeded threshold error count (${errorCount} >= ${rule.threshold}).`
        });
      }
    }
  });

  res.json({ success: true, percentiles, incidentsCount: activeIncidents.length });
});

app.listen(PORT, () => {
  console.log(`[Phryctoria Log Aggregator API] Listening on port ${PORT}`);
});
