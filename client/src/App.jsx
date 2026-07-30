import React, { useState, useEffect } from 'react';
import { Flame, ShieldCheck, AlertTriangle, Clock, Plus, RefreshCw, Filter, Search, Terminal, Server, Layers, BarChart2, CheckCircle2, AlertCircle, Zap, Radio } from 'lucide-react';

const API_BASE = '/api/v1';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [percentiles, setPercentiles] = useState({ p50_ms: 45, p95_ms: 820, p99_ms: 2450 });
  const [incidents, setIncidents] = useState([]);
  const [rules, setRules] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    service: 'payment-gateway',
    metric: '500_error_count',
    threshold: '5',
    window_seconds: '60'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Logs
      const params = new URLSearchParams();
      if (serviceFilter !== 'All') params.append('service', serviceFilter);
      if (levelFilter !== 'All') params.append('level', levelFilter);
      if (searchQuery) params.append('search', searchQuery);

      const logsRes = await fetch(`${API_BASE}/logs?${params.toString()}`);
      if (logsRes.ok) {
        const data = await logsRes.json();
        if (data.data) setLogs(data.data);
      }

      // Fetch Percentiles
      const pRes = await fetch(`${API_BASE}/analytics/percentiles?service=${serviceFilter}`);
      if (pRes.ok) {
        const data = await pRes.json();
        if (data.percentiles) setPercentiles(data.percentiles);
      }

      // Fetch Alerts
      const alertsRes = await fetch(`${API_BASE}/alerts`);
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (data.incidents) setIncidents(data.incidents);
        if (data.rules) setRules(data.rules);
      }
    } catch (err) {
      console.warn("API connecting or fallback to local state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [serviceFilter, levelFilter, searchQuery]);

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleFormData.name) return;

    try {
      const res = await fetch(`${API_BASE}/alerts/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleFormData)
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.warn("Save rule error:", err);
    }

    setIsModalOpen(false);
    setRuleFormData({ name: '', service: 'payment-gateway', metric: '500_error_count', threshold: '5', window_seconds: '60' });
  };

  // Stats
  const totalLogs = logs.length;
  const activeIncidentsCount = incidents.filter(i => i.status === 'Active').length;
  const errorCount = logs.filter(l => l.level === 'ERROR').length;

  return (
    <div className="container">
      {/* Black-Red Theme Header */}
      <header className="app-header">
        <div className="logo-group">
          <div className="logo-icon">
            <Flame color="#ffffff" size={26} />
          </div>
          <div>
            <h1 className="logo-title">Phryctoria</h1>
            <p className="logo-subtitle">Distributed Log Aggregator & Alerting Engine</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw className={loading ? 'spin' : ''} size={16} />
            Stream Sync
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Create Alert Rule
          </button>
        </div>
      </header>

      {/* Stats & Latency Percentiles Grid ($p50$, $p95$, $p99$) */}
      <div className="stats-grid">
        <div className="card card-red-glow stat-card">
          <div className="stat-label">Total Ingested Logs</div>
          <div className="stat-value">{totalLogs}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            <span style={{ color: 'var(--accent-red-bright)', fontWeight: 700 }}>{errorCount} errors</span> detected in stream
          </div>
        </div>

        <div className="card card-red-glow stat-card">
          <div className="stat-label">$p50$ Median Latency</div>
          <div className="stat-value" style={{ color: 'var(--status-operational)' }}>
            {percentiles.p50_ms || 0} <span style={{ fontSize: '1rem' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            50th percentile response time
          </div>
        </div>

        <div className="card card-red-glow stat-card">
          <div className="stat-label">$p95$ Latency Percentile</div>
          <div className="stat-value" style={{ color: 'var(--status-degraded)' }}>
            {percentiles.p95_ms || 0} <span style={{ fontSize: '1rem' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            95th percentile threshold
          </div>
        </div>

        <div className="card card-red-glow stat-card">
          <div className="stat-label">$p99$ Tail Latency Spike</div>
          <div className="stat-value" style={{ color: percentiles.p99_ms > 1000 ? 'var(--accent-red-bright)' : 'var(--text-primary)' }}>
            {percentiles.p99_ms || 0} <span style={{ fontSize: '1rem' }}>ms</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            99th percentile max latency
          </div>
        </div>
      </div>

      {/* Latency Visualizer Progress Cards */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="card card-red-glow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
              <Zap size={20} color="var(--accent-red-bright)" />
              Latency Percentiles Distribution ($p50$, $p95$, $p99$)
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Radio size={14} color="var(--accent-red-bright)" /> Sliding Window Analysis
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>p50 (Median)</span>
                <span className="mono" style={{ color: 'var(--status-operational)' }}>{percentiles.p50_ms} ms</span>
              </div>
              <div style={{ height: '9px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (percentiles.p50_ms / 3500) * 100)}%`, height: '100%', background: 'var(--status-operational)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>p95 (95th Percentile)</span>
                <span className="mono" style={{ color: 'var(--status-degraded)' }}>{percentiles.p95_ms} ms</span>
              </div>
              <div style={{ height: '9px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (percentiles.p95_ms / 3500) * 100)}%`, height: '100%', background: 'var(--status-degraded)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>p99 (Tail Latency Spike)</span>
                <span className="mono" style={{ color: 'var(--accent-red-bright)' }}>{percentiles.p99_ms} ms</span>
              </div>
              <div style={{ height: '9px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (percentiles.p99_ms / 3500) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #dc2626, #ef4444)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filterable Live Log Stream Table */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="section-header">
          <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={22} color="var(--accent-red-bright)" />
            Live Ingested Log Stream
          </h2>
          <span className="badge badge-down">
            <span className="pulse-dot"></span> Live Telemetry Buffer
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search log messages or errors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select 
              className="form-input" 
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
            >
              <option value="All">All Microservices</option>
              <option value="auth-service">auth-service</option>
              <option value="payment-gateway">payment-gateway</option>
              <option value="order-api">order-api</option>
              <option value="search-indexer">search-indexer</option>
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select 
              className="form-input" 
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
            >
              <option value="All">All Severity Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Severity Level</th>
                  <th>Microservice</th>
                  <th>HTTP Code</th>
                  <th>Latency</th>
                  <th>Log Message Payload</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No matching log payloads found in stream buffer.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className={`badge ${log.level === 'ERROR' ? 'badge-down' : log.level === 'WARN' ? 'badge-degraded' : 'badge-operational'}`}>
                          {log.level}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{log.service}</span>
                      </td>
                      <td>
                        <span className="mono" style={{ color: log.http_status >= 500 ? 'var(--accent-red-bright)' : 'var(--status-operational)' }}>
                          {log.http_status}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ color: log.latency_ms > 800 ? 'var(--status-degraded)' : 'var(--text-primary)' }}>
                          {log.latency_ms} ms
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {log.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Incident Alert Feed */}
      <section>
        <div className="section-header">
          <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={22} color="var(--accent-red-bright)" />
            Automated Threshold Incident Alerts
          </h2>
          <span className="badge badge-down">{activeIncidentsCount} Active Alerts</span>
        </div>

        <div className="incident-list">
          {incidents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No active threshold incidents detected.
            </div>
          ) : (
            incidents.map(inc => (
              <div className="incident-card" key={inc.id}>
                <div style={{ color: inc.status === 'Active' ? 'var(--accent-red-bright)' : 'var(--status-operational)', marginTop: '2px' }}>
                  {inc.status === 'Active' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>[{inc.service}] - {inc.type}</span>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(inc.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{inc.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Create Alert Rule Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid rgba(220,38,38,0.2)', paddingBottom: '0.8rem' }}>
              Configure Automated Threshold Alert Rule
            </h3>
            <form onSubmit={handleCreateRule}>
              <div className="form-group">
                <label className="form-label">Rule Name / Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Critical 500 Error Breach"
                  value={ruleFormData.name}
                  onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Microservice</label>
                <select 
                  className="form-input"
                  value={ruleFormData.service}
                  onChange={e => setRuleFormData({ ...ruleFormData, service: e.target.value })}
                >
                  <option value="auth-service">auth-service</option>
                  <option value="payment-gateway">payment-gateway</option>
                  <option value="order-api">order-api</option>
                  <option value="search-indexer">search-indexer</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Metric Condition</label>
                  <select 
                    className="form-input"
                    value={ruleFormData.metric}
                    onChange={e => setRuleFormData({ ...ruleFormData, metric: e.target.value })}
                  >
                    <option value="500_error_count">500-level Error Count</option>
                    <option value="p99_latency_ms">p99 Latency (ms)</option>
                    <option value="p95_latency_ms">p95 Latency (ms)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Breach Threshold</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={ruleFormData.threshold}
                    onChange={e => setRuleFormData({ ...ruleFormData, threshold: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Alert Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
