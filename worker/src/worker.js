const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const POLLING_INTERVAL_MS = 6000;

console.log(`[Phryctoria Stream Worker] Telemetry stream worker starting. Target server: ${SERVER_URL}`);

const SERVICES = ["auth-service", "payment-gateway", "order-api", "search-indexer"];
const LOG_MESSAGES = [
  { level: "INFO", message: "Processed incoming HTTP GET request", latency_range: [20, 80], status: 200 },
  { level: "INFO", message: "User session token validated successfully", latency_range: [15, 60], status: 200 },
  { level: "WARN", message: "Cache memory allocation reaching 85% capacity", latency_range: [200, 450], status: 200 },
  { level: "ERROR", message: "Database pool connection timeout on query execution", latency_range: [1500, 3200], status: 504 },
  { level: "ERROR", message: "Upstream payment provider returned HTTP 500 Internal Error", latency_range: [800, 2100], status: 500 }
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateMicroserviceTelemetry() {
  const service = getRandomItem(SERVICES);
  const template = getRandomItem(LOG_MESSAGES);
  const latency_ms = getRandomInt(template.latency_range[0], template.latency_range[1]);

  try {
    const res = await axios.post(`${SERVER_URL}/api/v1/telemetry/ingest`, {
      service,
      level: template.level,
      message: `[${service}] ${template.message}`,
      latency_ms,
      http_status: template.status
    });
    console.log(`[Stream Worker Ingest] ${service} -> Level: ${template.level}, Latency: ${latency_ms}ms, HTTP: ${template.status}`);
  } catch (err) {
    console.error(`[Stream Worker Ingest Error] Failed to transmit payload to ${SERVER_URL}: ${err.message}`);
  }
}

async function evaluateRulesAndPercentiles() {
  try {
    const res = await axios.post(`${SERVER_URL}/api/v1/worker/evaluate`);
    if (res.data && res.data.percentiles) {
      const p = res.data.percentiles;
      console.log(`[Stream Worker Analytics] Percentile Evaluation -> p50: ${p.p50}ms | p95: ${p.p95}ms | p99: ${p.p99}ms`);
    }
  } catch (err) {
    console.error(`[Stream Worker Eval Error] Failed to trigger rule evaluation: ${err.message}`);
  }
}

async function runWorkerCycle() {
  await simulateMicroserviceTelemetry();
  await evaluateRulesAndPercentiles();
}

// Initial run & continuous loop
runWorkerCycle();
setInterval(runWorkerCycle, POLLING_INTERVAL_MS);
