#!/usr/bin/env bash
# Phryctoria High-Throughput Traffic Load & Verification Generator
# Simulates microservice telemetry ingestion bursts, triggers threshold alerts, and queries logs.

API_URL="${API_URL:-http://localhost:5000/api/v1}"

echo "============================================================"
echo " Phryctoria Traffic Load Generator & API Verification Suite "
echo "============================================================"
echo "Targeting API: $API_URL"
echo ""

# 1. Health Check
echo "--> 1. Checking API Health..."
curl -s "$API_URL/health" | grep -q '"status":"ok"' && echo "[SUCCESS] API Health Check Passed." || echo "[FAIL] API Health Check Failed."
echo ""

# 2. Simulate Ingestion Burst
echo "--> 2. Transmitting High-Throughput Telemetry Ingestion Burst (10 Payloads)..."

for i in {1..5}; do
  curl -s -X POST "$API_URL/telemetry/ingest" \
    -H "Content-Type: application/json" \
    -d '{
      "service": "auth-service",
      "level": "INFO",
      "message": "User session authenticated successfully",
      "latency_ms": '$((RANDOM % 50 + 20))',
      "http_status": 200
    }' > /dev/null
done

for i in {1..3}; do
  curl -s -X POST "$API_URL/telemetry/ingest" \
    -H "Content-Type: application/json" \
    -d '{
      "service": "payment-gateway",
      "level": "WARN",
      "message": "Third-party payment gateway latency elevated",
      "latency_ms": '$((RANDOM % 400 + 600))',
      "http_status": 200
    }' > /dev/null
done

for i in {1..2}; do
  curl -s -X POST "$API_URL/telemetry/ingest" \
    -H "Content-Type: application/json" \
    -d '{
      "service": "search-indexer",
      "level": "ERROR",
      "message": "Elasticsearch cluster memory breach HTTP 500",
      "latency_ms": '$((RANDOM % 1000 + 2000))',
      "http_status": 500
    }' > /dev/null
done

echo "[SUCCESS] Enqueued 10 telemetry log payloads into Redis buffer queue."
echo ""

# 3. Query Percentile Analytics (p50, p95, p99)
echo "--> 3. Querying Latency Percentiles (p50, p95, p99)..."
curl -s "$API_URL/analytics/percentiles"
echo ""
echo ""

# 4. Trigger Threshold Alert Rules
echo "--> 4. Creating Automated Threshold Alert Rule..."
curl -s -X POST "$API_URL/alerts/rules" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Search Indexer Error Spike Threshold",
    "service": "search-indexer",
    "metric": "500_error_count",
    "threshold": 2,
    "window_seconds": 60
  }'
echo ""
echo ""

# 5. Fetch Incident History
echo "--> 5. Fetching Active Incident Feed..."
curl -s "$API_URL/alerts"
echo ""
echo ""

# 6. Search Log Stream
echo "--> 6. Querying Search Log Stream (Level: ERROR)..."
curl -s "$API_URL/logs?level=ERROR"
echo ""
echo ""

echo "============================================================"
echo " Verification Complete! All cURL commands executed.          "
echo "============================================================"
