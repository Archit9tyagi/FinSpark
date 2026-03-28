import { useState, useEffect } from 'react';
import { getTemplates, getTemplateConfig } from '../api';

const FALLBACK_TEMPLATES = [
  { id: 'cibil', name: 'CIBIL Reporting', version: 'v2.1.0', status: 'Stable', icon: 'speed', category: 'credit-bureau',
    description: 'Hardened XML-to-JSON transformer with built-in retry logic and encryption handling.' },
  { id: 'uidai', name: 'UIDAI eKYC', version: 'v4.0.2', status: 'Secure', icon: 'fingerprint', category: 'identity-verification',
    description: 'Aadhaar Data Vault (ADV) compliance integrated with HSM digital signing hooks.' },
  { id: 'razorpay', name: 'Razorpay Checkout', version: 'v1.8.4', status: 'Enterprise', icon: 'payments', category: 'payment-gateway',
    description: 'Webhook security, signature verification, and automated idempotent processing.' },
];

const ICON_COLORS = {
  'credit-bureau': { bg: 'rgba(0,212,255,0.1)', color: 'var(--primary-container)' },
  'identity-verification': { bg: 'rgba(96,1,209,0.1)', color: 'var(--secondary-container)' },
  'payment-gateway': { bg: 'rgba(73,218,159,0.1)', color: 'var(--tertiary-container)' },
};

export default function Templates() {
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateConfig, setTemplateConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    getTemplates().then(res => {
      if (res.success && res.templates?.length) setTemplates(res.templates);
    }).catch(() => {});
  }, []);

  const handleViewConfig = async (id) => {
    setSelectedTemplate(id);
    setLoadingConfig(true);
    try {
      const res = await getTemplateConfig(id);
      if (res.success) setTemplateConfig(res.config);
    } catch {
      setTemplateConfig(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-headline">Standard Connectors</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Pre-validated blueprints for Indian ecosystem integrations.</p>
        </div>
        <button style={{
          color: 'var(--primary-container)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase', letterSpacing: '0.15em', borderBottom: '1px solid var(--primary-container)',
          background: 'none', border: 'none', borderBottom: '1px solid var(--primary-container)', cursor: 'pointer', paddingBottom: '0.25rem'
        }}>Explore Registry</button>
      </div>

      <div className="grid-3">
        {templates.map(t => {
          const colors = ICON_COLORS[t.category] || ICON_COLORS['credit-bureau'];
          const isSelected = selectedTemplate === t.id;
          return (
            <div key={t.id} className={`card card-interactive ${isSelected ? 'scan-line' : ''}`}
              style={{ padding: '2rem', cursor: 'pointer', border: isSelected ? '1px solid rgba(0,212,255,0.3)' : undefined }}
              onClick={() => handleViewConfig(t.id)}
            >
              <div style={{
                width: '3rem', height: '3rem', background: colors.bg, borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                transition: 'transform 0.3s'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.875rem', color: colors.color }}>{t.icon}</span>
              </div>
              <h4 className="text-title" style={{ marginBottom: '0.5rem' }}>{t.name}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{t.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-label" style={{ color: 'var(--outline)' }}>{t.version} {t.status}</span>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>arrow_outward</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Config Preview */}
      {selectedTemplate && (
        <div className="panel animate-slide-down">
          <div className="panel-header">
            <div className="panel-header-left">
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>code</span>
              <h3 className="text-title">Template Config — {templates.find(t => t.id === selectedTemplate)?.name}</h3>
            </div>
            <button className="btn-icon" onClick={() => setSelectedTemplate(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div style={{ padding: '1.5rem', background: 'var(--bg-void)', fontFamily: 'var(--font-code)', fontSize: '0.8125rem', lineHeight: 1.7, maxHeight: '500px', overflowY: 'auto' }}>
            {loadingConfig ? (
              <div className="flex items-center justify-center gap-4" style={{ padding: '3rem', color: 'var(--outline)' }}>
                <div className="spinner" /> Loading configuration...
              </div>
            ) : templateConfig ? (
              <pre style={{ color: 'var(--on-surface-variant)', whiteSpace: 'pre-wrap' }}>
                {templateConfig.gateway_config || JSON.stringify(templateConfig, null, 2)}
              </pre>
            ) : (
              <div style={{ color: 'var(--outline)', textAlign: 'center', padding: '3rem' }}>
                Failed to load configuration
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
