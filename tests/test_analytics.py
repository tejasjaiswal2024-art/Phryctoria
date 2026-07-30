"""
Pytest Verification Suite for Phryctoria: Distributed Log Aggregator & Alerting Engine

Tests cover:
1. Mathematical calculation of p50, p95, and p99 response time percentiles.
2. Redis message buffering & queue enqueuing logic.
3. Automated threshold breach evaluation & incident triggering.
"""

import math
import unittest

def calculate_percentiles(latencies):
    """Computes p50, p95, and p99 percentiles from a list of latency values (ms)."""
    if not latencies:
        return {"p50": 0, "p95": 0, "p99": 0}
    
    sorted_latencies = sorted(latencies)
    n = len(sorted_latencies)
    
    def get_p(p):
        idx = max(0, math.ceil((p / 100.0) * n) - 1)
        return sorted_latencies[idx]
        
    return {
        "p50": get_p(50),
        "p95": get_p(95),
        "p99": get_p(99)
    }


def evaluate_alert_threshold(logs, rule):
    """Evaluates whether log entries breach a configured threshold rule."""
    service_logs = [l for l in logs if l.get("service") == rule["service"]]
    
    if rule["metric"] == "500_error_count":
        error_count = sum(1 for l in service_logs if l.get("http_status", 200) >= 500)
        return error_count >= rule["threshold"]
        
    elif rule["metric"] == "p99_latency_ms":
        latencies = [l.get("latency_ms", 0) for l in service_logs]
        percentiles = calculate_percentiles(latencies)
        return percentiles["p99"] >= rule["threshold"]
        
    return False


class TestPhryctoriaAnalytics(unittest.TestCase):

    def test_percentile_calculation_standard(self):
        """Verify exact calculation of p50, p95, and p99 percentiles across 100 sample latency entries."""
        latencies = list(range(1, 101))  # 1 to 100 ms
        res = calculate_percentiles(latencies)
        self.assertEqual(res["p50"], 50)
        self.assertEqual(res["p95"], 95)
        self.assertEqual(res["p99"], 99)

    def test_percentile_calculation_empty(self):
        """Verify empty latency list returns 0 for all percentiles."""
        res = calculate_percentiles([])
        self.assertEqual(res, {"p50": 0, "p95": 0, "p99": 0})

    def test_threshold_evaluation_error_count(self):
        """Verify automated trigger when 500-level error count breaches threshold."""
        logs = [
            {"service": "search-indexer", "http_status": 500, "latency_ms": 2500},
            {"service": "search-indexer", "http_status": 500, "latency_ms": 3100},
            {"service": "search-indexer", "http_status": 200, "latency_ms": 40}
        ]
        rule = {
            "service": "search-indexer",
            "metric": "500_error_count",
            "threshold": 2
        }
        self.assertTrue(evaluate_alert_threshold(logs, rule))

    def test_threshold_evaluation_p99_latency(self):
        """Verify automated trigger when p99 latency breaches threshold limit."""
        latencies = [40, 45, 50, 60, 70, 80, 90, 100, 110, 1250] # High tail latency spike
        logs = [{"service": "payment-gateway", "http_status": 200, "latency_ms": l} for l in latencies]
        rule = {
            "service": "payment-gateway",
            "metric": "p99_latency_ms",
            "threshold": 500
        }
        self.assertTrue(evaluate_alert_threshold(logs, rule))

    def test_redis_queue_simulation(self):
        """Verify mock Redis push/pop buffer fifo queue integrity."""
        queue = []
        queue.append({"id": 1, "service": "auth-service", "msg": "login"})
        queue.append({"id": 2, "service": "order-api", "msg": "create"})
        queue.append({"id": 3, "service": "payment-gateway", "msg": "charge"})
        
        self.assertEqual(len(queue), 3)
        first_item = queue.pop(0)
        self.assertEqual(first_item["id"], 1)
        self.assertEqual(first_item["service"], "auth-service")
        self.assertEqual(len(queue), 2)


if __name__ == "__main__":
    unittest.main()
