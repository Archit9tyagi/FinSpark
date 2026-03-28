import { useState, useEffect } from 'react';
import { getAuditHistory } from '../api';

const COMPLIANCE_DATA = [
  { standard: 'RBI Circular 2025/12', status: 'Compliant', lastAudit: '2 hours ago', confidence: 98 },
  { standard: 'DPDP Act (India)', status: 'Compliant', lastAudit: '4 hours ago', confidence: 100 },
  { standard: 'UIDAI ADV Policy', status: 'Action Required', lastAudit: '12 mins ago', confidence: 72 },
  { standard: 'ISO 20022 Swifts', status: 'Compliant', lastAudit: 'Yesterday', confidence: 94 },
  { standard: 'PCI-DSS v4.0', status: 'Compliant', lastAudit: '6 hours ago', confidence: 96 },
];

const AUDIT_ENTRIES = [
  { time: '14:22:11', text: 'System verified RSA-4096 signature for UIDAI module.', type: 'info' },
  { time: '14:18:45', text: 'Configuration #CF-8821 deployed to KONG:Sandbox.', type: 'info' },
  { time: '14:15:30', text: 'Warning: Aadhaar masking plugin latency exceeded 50ms.', type: 'warning' },
  { time: '14:10:02', text: 'Audit trail synced to enterprise HSM vault.', type: 'info' },
  { time: '14:05:55', text: 'User admin_sec authorized for PROD export.', type: 'info' },
  { time: '13:58:12', text: 'PII scan completed. 4 Aadhaar tokens rotated.', type: 'info' },
  { time: '13:52:30', text: 'Config #CF-8820 passed schema validation.', type: 'info' },
  { time: '13:45:00', text: 'Compliance check: RBI DL-2025 Section 4.2 — PASS', type: 'info' },
];

export default function Compliance() {
  const [auditHistory, setAuditHistory] = useState([]);

  useEffect(() => {
    getAuditHistory(20).then(res => {
      if (res.success) setAuditHistory(res.entries);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Compliance Matrix */}
        <div className="space-y-8">
          <h3 className="text-headline-sm">Compliance Matrix</h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Regulatory Standard</th>
                  <th>Status</th>
                  <th>Last Audit</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_DATA.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{row.standard}</td>
                    <td>
                      <span className={`status-badge ${row.status === 'Compliant' ? 'compliant' : 'action-required'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                          {row.status === 'Compliant' ? 'check_circle' : 'warning'}
                        </span>
                        {row.status === 'Compliant' ? 'Compliant' : 'Action Req'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--outline)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{row.lastAudit}</td>
                    <td>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${row.confidence >= 90 ? 'high' : row.confidence >= 70 ? 'medium' : 'low'}`}
                          style={{ width: `${row.confidence}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Stream */}
        <div className="space-y-8">
          <h3 className="text-headline-sm">Audit Stream</h3>
          <div className="card" style={{ background: 'var(--bg-container-lowest)', height: '450px', display: 'flex', flexDirection: 'column' }}>
            <div className="audit-stream">
              {(auditHistory.length > 0 ? auditHistory : AUDIT_ENTRIES).map((entry, i) => {
                const isServerEntry = !!entry.action;
                const time = isServerEntry
                  ? new Date(entry.created_at).toLocaleTimeString('en-IN', { hour12: false })
                  : entry.time;
                const text = isServerEntry
                  ? `${entry.action} | Env: ${entry.environment || 'UAT'} | PII: ${entry.pii_detected || 0} masked | ${entry.validation_status || ''}`
                  : entry.text;
                const isWarning = isServerEntry ? entry.validation_status === 'REVIEW_REQUIRED' : entry.type === 'warning';

                return (
                  <div key={i} className={`audit-entry ${isWarning ? 'audit-warning' : ''}`}>
                    <span className="audit-time">{time}</span>
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
            <div className="audit-footer">
              <div className="audit-live-dot" />
              Live Audit Stream Active
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Summary */}
      <div className="space-y-8">
        <h3 className="text-headline-sm">Security Architecture Summary</h3>
        <div className="grid-3">
          {[
            { icon: 'shield_lock', title: 'Zero Trust Architecture', desc: 'Every component authenticates independently. No implicit trust between services. mTLS enforced on all internal communication.', color: 'var(--primary-container)' },
            { icon: 'enhanced_encryption', title: 'Data Protection', desc: 'PII detection & tokenization before LLM processing. Aadhaar Data Vault with AES-256-GCM encryption. No raw PII in logs.', color: 'var(--secondary-container)' },
            { icon: 'psychology', title: 'AI Safety', desc: 'Prompt injection defense via input sanitization & instruction/data separation. Output validated against strict JSON schemas.', color: 'var(--tertiary-container)' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: '2rem' }}>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)',
                background: `${item.color}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '1rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: item.color }}>{item.icon}</span>
              </div>
              <h4 className="text-title" style={{ marginBottom: '0.5rem' }}>{item.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
