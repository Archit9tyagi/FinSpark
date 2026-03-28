import { useState, useEffect } from 'react';

const METRICS = [
  { label: 'Configs Generated', value: '2,847', trend: '+12% this month', icon: 'trending_up', accent: 'accent-primary', trendClass: 'positive' },
  { label: 'Avg Generation Time', value: '1.8s', trend: 'Top 0.1% speed', icon: 'bolt', accent: 'accent-secondary', trendClass: 'positive' },
  { label: 'Security Score', value: '98.6', suffix: '/100', trend: 'Hardened profile active', icon: 'verified', accent: 'accent-tertiary', trendClass: 'neutral' },
  { label: 'Compliance Rate', value: '100%', trend: 'Zero audit flags', icon: 'check_circle', accent: 'accent-primary', trendClass: 'positive' },
];

const AUDIT_ENTRIES = [
  { time: '14:22:11', text: 'System verified <span class="audit-highlight">RSA-4096</span> signature for UIDAI module.' },
  { time: '14:18:45', text: 'Configuration <span style="font-family:var(--font-mono)">#CF-8821</span> deployed to KONG:Sandbox.' },
  { time: '14:15:30', text: 'Warning: Aadhaar masking plugin latency exceeded 50ms.', isWarning: true },
  { time: '14:10:02', text: 'Audit trail synced to enterprise HSM vault.' },
  { time: '14:05:55', text: 'User <span class="audit-highlight">admin_sec</span> authorized for PROD export.' },
];

export default function Dashboard({ onNavigate }) {
  const [animateMetrics, setAnimateMetrics] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateMetrics(true), 200);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="grid-10 dot-grid" style={{ padding: '3rem 0', alignItems: 'center' }}>
        <div className="col-span-6 space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <span style={{
              display: 'inline-block', padding: '0.25rem 0.75rem',
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
              color: 'var(--primary-container)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-sm)'
            }}>PROTOCOL v4.2.0</span>
            <h1 className="text-display">
              Transform BRDs into <br />
              <span style={{
                background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>Production-Ready Configs</span>
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--on-surface-variant)', maxWidth: '36rem' }}>
              Automated, AI-driven generation of secure gateway configurations for India's Core Banking ecosystem. From FIPS 140-2 compliance to sub-200ms validation.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('generator')}>
              Generate Configuration
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('compliance')}>
              View Architecture
            </button>
          </div>
          <div className="flex items-center gap-8" style={{ paddingTop: '2rem' }}>
            {[
              { label: 'Security Standard', value: 'FIPS 140-2' },
              { label: 'Regulatory Ready', value: 'RBI 2025 compliant' },
              { label: 'Latency Bench', value: '<200ms execution' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-8">
                {i > 0 && <div style={{ width: 1, height: '2rem', background: 'rgba(60,73,78,0.2)' }} />}
                <div className="flex flex-col">
                  <span className="text-label" style={{ color: 'var(--outline)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{
            position: 'absolute', inset: '-0.25rem',
            background: 'linear-gradient(to right, rgba(0,212,255,0.2), rgba(96,1,209,0.2))',
            filter: 'blur(40px)', borderRadius: '1rem', opacity: 0.6
          }} />
          <div style={{
            position: 'relative', background: 'var(--bg-container-lowest)',
            border: '1px solid rgba(60,73,78,0.2)', borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div className="flex items-center gap-2" style={{
              padding: '0.5rem 1rem', background: 'var(--bg-container-high)',
              borderBottom: '1px solid rgba(60,73,78,0.2)'
            }}>
              <div className="flex gap-1">
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,180,171,0.4)' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(96,1,209,0.4)' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(73,218,159,0.4)' }} />
              </div>
              <span className="text-label" style={{ marginLeft: '1rem', color: 'var(--outline)' }}>stream_output.yaml</span>
            </div>
            <div style={{ padding: '1.5rem', fontFamily: 'var(--font-code)', fontSize: '0.75rem', lineHeight: 1.8 }}>
              <div style={{ color: 'var(--primary-container)' }}>services:</div>
              <div style={{ paddingLeft: '1rem', color: 'var(--on-surface-variant)' }}>- name: core-banking-api</div>
              <div style={{ paddingLeft: '2rem', color: 'var(--on-surface-variant)' }}>url: https://internal.gateway.node</div>
              <div style={{ paddingLeft: '2rem', color: 'var(--on-surface-variant)' }}>routes:</div>
              <div style={{ paddingLeft: '3rem', color: 'var(--on-surface-variant)' }}>- name: balance-enquiry</div>
              <div style={{ paddingLeft: '3rem', color: 'var(--on-surface-variant)' }}>  paths: ["/v1/balance"]</div>
              <div style={{ color: 'var(--secondary)' }}>plugins:</div>
              <div style={{ paddingLeft: '1rem', color: 'var(--on-surface-variant)' }}>- name: rbi-compliance-validator</div>
              <div style={{ paddingLeft: '2rem', color: 'var(--on-surface-variant)' }}>  config:</div>
              <div style={{ paddingLeft: '3rem', color: 'var(--on-surface-variant)' }}>    mask_pii: true</div>
              <div style={{ paddingLeft: '3rem', color: 'var(--on-surface-variant)' }}>    log_audit: encrypted</div>
              <div style={{ paddingLeft: '1rem', color: 'var(--tertiary-container)' }}>- name: jwt-keycloak-auth</div>
              <div className="flex mt-4">
                <span style={{ color: 'var(--primary-container)', fontWeight: 700 }}>Forge:</span>
                <span className="animate-blink" style={{ marginLeft: '0.5rem', color: 'var(--on-surface)' }}>█</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="grid-4" style={{ animation: animateMetrics ? 'fadeInUp 0.5s ease-out' : 'none' }}>
        {METRICS.map((m, i) => (
          <div key={i} className={`card metric-card ${m.accent}`}>
            <span className="metric-label">{m.label}</span>
            <span className="metric-value">{m.value}{m.suffix && <span className="metric-value-suffix">{m.suffix}</span>}</span>
            <div className={`metric-trend ${m.trendClass}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>{m.icon}</span>
              <span>{m.trend}</span>
            </div>
          </div>
        ))}
      </section>

      {/* SECURITY FLOW */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-headline">Security Flow Architecture</h2>
          <p style={{ color: 'var(--on-surface-variant)', maxWidth: '42rem', margin: '0 auto' }}>
            Every configuration is synthesized through a multi-layered trust hierarchy ensuring compliance with RBI 2025 and FIPS 140-2 standards.
          </p>
        </div>
        <div className="card dot-grid" style={{ padding: '2rem', background: 'var(--bg-container-lowest)', minHeight: '400px', borderColor: 'rgba(60,73,78,0.1)' }}>
          <div className="security-flow">
            <FlowNode icon="description" label="Source" tooltip="BRD Payload Input" type="outline-only" />
            <div className="flow-connector to-secondary" />
            <FlowNode icon="psychology" iconSize="1.875rem" label="Intelligence" tooltip="AI Orchestrator Engine" type="secondary" />
            <div className="flow-connector" />
            <FlowNode icon="shield_lock" label="Hardening" tooltip="FIPS HSM Key Vault" type="primary" />
            <div className="flow-connector to-tertiary" />
            <FlowNode icon="hub" label="Gateway" tooltip="API Gateway (KONG)" type="tertiary" />
          </div>
        </div>
      </section>

      {/* AUDIT STREAM PREVIEW */}
      <section className="space-y-8">
        <h3 className="text-headline-sm">Live Audit Stream</h3>
        <div className="card" style={{ background: 'var(--bg-container-lowest)', maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <div className="audit-stream">
            {AUDIT_ENTRIES.map((entry, i) => (
              <div key={i} className={`audit-entry ${entry.isWarning ? 'audit-warning' : ''}`}>
                <span className="audit-time">{entry.time}</span>
                <span dangerouslySetInnerHTML={{ __html: entry.text }} />
              </div>
            ))}
          </div>
          <div className="audit-footer">
            <div className="audit-live-dot" />
            Live Audit Stream Active
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-headline-sm">Integration Lifecycle</h3>
          <div className="tech-badges">
            <span className="tech-badge">AI Layer: Gemini 2.5 Pro</span>
            <span className="tech-badge">Gateway: Kong Mesh</span>
            <span className="tech-badge">Security: Zero Trust</span>
            <span className="tech-badge">Observability: OpenTelemetry</span>
          </div>
        </div>
        <div style={{ paddingTop: '3rem' }}>
          <div className="timeline">
            {[
              { label: 'Analysis', sub: 'BRD Semantic Mapping', status: 'active' },
              { label: 'Synthesis', sub: 'Config Generation', status: 'active' },
              { label: 'Validation', sub: 'Compliance Scan (Active)', status: 'current' },
              { label: 'Signing', sub: 'HSM Encrypted Export', status: 'pending' },
              { label: 'Deploy', sub: 'Live Control Plane Sync', status: 'pending' },
            ].map((node, i) => (
              <div key={i} className="timeline-node">
                <div className={`timeline-dot ${node.status}`}>
                  {node.status === 'current' && (
                    <span className="material-symbols-outlined" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '100%', fontSize: '0.875rem', color: 'var(--on-primary)',
                      fontWeight: 700, fontVariationSettings: "'FILL' 1"
                    }}>bolt</span>
                  )}
                </div>
                <span className="timeline-label" style={{ color: node.status === 'current' ? 'var(--primary-container)' : node.status === 'active' ? 'var(--on-surface)' : 'var(--outline)' }}>
                  {node.label}
                </span>
                <span className="timeline-sublabel">{node.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FlowNode({ icon, iconSize, label, tooltip, type }) {
  return (
    <div className="flow-node">
      <div className={`flow-node-circle ${type}`}>
        <span className="material-symbols-outlined" style={{
          fontSize: iconSize || '1.5rem',
          color: type === 'secondary' ? 'var(--secondary-container)' :
                 type === 'primary' ? 'var(--primary-container)' :
                 type === 'tertiary' ? 'var(--tertiary-container)' : 'var(--outline)'
        }}>{icon}</span>
        <div className="flow-tooltip">{tooltip}</div>
      </div>
      <span className="flow-node-label">{label}</span>
    </div>
  );
}
