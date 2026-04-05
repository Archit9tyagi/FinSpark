import { useState, useRef } from 'react';
import { generateConfig, uploadFile, uploadText } from '../api';

const SAMPLE_BRD = `BUSINESS REQUIREMENT DOCUMENT
Project: Digital Lending Platform - Phase 2
Section 4: Credit Assessment Integration

4.1 Credit Bureau Check
The system must integrate with CIBIL TransUnion API v2.0 for real-time
credit score retrieval during loan application processing.

Requirements:
- Trigger credit check when loan application reaches "Assessment" stage
- Input: Applicant PAN, Name, Date of Birth, Loan Amount
- Expected Response: Credit Score, Report Summary, DPD History
- Timeout: Maximum 30 seconds
- Fallback: If CIBIL is unavailable, queue for retry (max 3 attempts)
- Authentication: mTLS with CIBIL-issued certificates
- Data Handling: Credit report must be encrypted at rest, retained for 90 days per RBI guidelines

4.2 Rate Limiting
- Maximum 100 credit checks per minute per branch
- Maximum 1000 credit checks per hour system-wide`;

export default function Generator() {
  const [brdContent, setBrdContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [environment, setEnvironment] = useState('UAT');
  const [gatewayType, setGatewayType] = useState('kong');
  const [securityProfile, setSecurityProfile] = useState('Level 3: Hardened Enterprise');
  const [integrationTypes, setIntegrationTypes] = useState(['CIBIL', 'UIDAI/eKYC']);
  const [outputFormat, setOutputFormat] = useState('yaml');
  const [activeTab, setActiveTab] = useState('gateway_config');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      try {
        const res = await uploadFile(file);
        if (res.success) {
          setBrdContent(res.security.sanitized_content || res.chunks.map(c => c.content).join('\n'));
        }
      } catch {
        setBrdContent('');
      }
    }
  };

  const handleGenerate = async () => {
    const content = brdContent.trim();
    if (!content) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateConfig({
        content,
        gatewayType,
        environment,
        securityProfile,
        integrationTypes
      });
      if (res.success) {
        setResult(res);
      } else {
        setError(res.error || 'Generation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setBrdContent(SAMPLE_BRD);
  };

  const getConfigContent = () => {
    if (!result?.configs) return '';
    const cfg = result.configs[activeTab];
    if (!cfg) return '// No content for this tab';
    if (typeof cfg === 'object') return JSON.stringify(cfg, null, 2);
    return cfg;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getConfigContent());
  };

  const handleDownload = () => {
    const content = getConfigContent();
    const ext = activeTab.includes('jolt') || activeTab.includes('test') ? 'json' : 'yaml';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finbridge_${activeTab}_${environment.toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleIntegration = (type) => {
    setIntegrationTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const tabs = [
    { id: 'gateway_config', label: 'Gateway Config' },
    { id: 'auth_policy', label: 'Auth Policies' },
    { id: 'jolt_transform', label: 'JOLT Transform' },
    { id: 'test_cases', label: 'Test Cases' },
    { id: 'rate_limiting', label: 'Rate Limiting' },
    { id: 'circuit_breaker', label: 'Circuit Breaker' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: '700px' }}>
      {/* LEFT: INPUT PANEL */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>description</span>
            <h2 className="text-title">BRD Input Specification</h2>
          </div>
          <div className="toggle-group">
            <button className={`toggle-btn ${environment === 'UAT' ? 'active' : ''}`} onClick={() => setEnvironment('UAT')}>UAT</button>
            <button className={`toggle-btn ${environment === 'PROD' ? 'active' : ''}`} onClick={() => setEnvironment('PROD')}>PROD</button>
          </div>
        </div>
        <div className="panel-body">
          {/* Upload Zone */}
          <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
            <span className="material-symbols-outlined">upload_file</span>
            <p>{uploadedFile ? uploadedFile.name : 'Drop BRD document here or click to browse'}</p>
            <span>Supports .PDF, .DOCX, .TXT</span>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </div>

          {/* Raw Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label" style={{ marginBottom: 0 }}>Raw Input Content</label>
              <button onClick={handleLoadSample} style={{
                fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--primary-container)',
                background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>Load Sample BRD</button>
            </div>
            <textarea
              value={brdContent}
              onChange={(e) => setBrdContent(e.target.value)}
              placeholder="Paste BRD textual content here for immediate analysis..."
            />
          </div>

          {/* Options Row */}
          <div className="grid-2">
            <div>
              <label className="form-label">Target Gateway</label>
              <div className="gateway-grid">
                {['kong', 'tyk', 'aws'].map(g => (
                  <button key={g} className={`gateway-btn ${gatewayType === g ? 'active' : ''}`} onClick={() => setGatewayType(g)}>
                    {g.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Security Profile</label>
              <select value={securityProfile} onChange={(e) => setSecurityProfile(e.target.value)}>
                <option>Level 3: Hardened Enterprise</option>
                <option>Level 2: Standard Banking</option>
                <option>Level 1: Internal Development</option>
              </select>
            </div>
          </div>

          {/* Integration Types */}
          <div>
            <label className="form-label">Integration Types</label>
            <div className="flex flex-wrap gap-2">
              {['CIBIL', 'UIDAI/eKYC', 'Razorpay', 'NSDL', 'NPCI'].map(type => (
                <span
                  key={type}
                  className={`tag ${integrationTypes.includes(type) ? 'tag-active' : 'tag-inactive'}`}
                  onClick={() => toggleIntegration(type)}
                >
                  {type}
                  {integrationTypes.includes(type) && (
                    <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>close</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={handleGenerate}
            disabled={loading || !brdContent.trim()}
            style={{ opacity: loading || !brdContent.trim() ? 0.6 : 1 }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Generating Secure Configuration...
              </>
            ) : (
              <>
                Generate Secure Configuration
                <span className="material-symbols-outlined">auto_awesome</span>
              </>
            )}
          </button>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', padding: '1rem', background: 'rgba(147,0,10,0.1)', borderRadius: 'var(--radius-sm)' }}>
              ⚠ {error}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: OUTPUT PANEL */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>terminal</span>
            <h2 className="text-title">Engine Output</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="toggle-group">
              <button className={`toggle-btn ${outputFormat === 'yaml' ? 'active-secondary' : ''}`} onClick={() => setOutputFormat('yaml')}>YAML</button>
              <button className={`toggle-btn ${outputFormat === 'json' ? 'active-secondary' : ''}`} onClick={() => setOutputFormat('json')}>JSON</button>
            </div>
            <button className="btn-icon" onClick={handleCopy} title="Copy"><span className="material-symbols-outlined">content_copy</span></button>
            <button className="btn-icon" onClick={handleDownload} title="Download"><span className="material-symbols-outlined">download</span></button>
          </div>
        </div>

        <div className="code-panel" style={{ flex: 1 }}>
          <div className="code-line-numbers">
            {Array.from({ length: 30 }, (_, i) => (
              <span key={i}>{String(i + 1).padStart(2, '0')}</span>
            ))}
          </div>
          <div className="code-content">
            <div className="code-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`code-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {result ? (
              <pre style={{ fontFamily: 'var(--font-code)', fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--on-surface-variant)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {getConfigContent()}
              </pre>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center gap-4" style={{ height: '60%', color: 'var(--outline)' }}>
                <div className="spinner" style={{ width: '2rem', height: '2rem', borderWidth: 2 }} />
                <span className="text-label">AI Engine Processing BRD...</span>
              </div>
            ) : (
              <div style={{ color: 'var(--outline)', fontStyle: 'italic', textAlign: 'center', paddingTop: '8rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}>code</span>
                <span className="text-label">Upload a BRD and click Generate to see output</span>
              </div>
            )}
          </div>
        </div>

        {/* Validation Bar */}
        <div className="validation-bar">
          <div className="validation-checks">
            {result ? (
              <>
                <div className={`validation-check ${result.validation?.schema_valid ? 'pass' : 'loading'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                    {result.validation?.schema_valid ? 'check_circle' : 'error'}
                  </span>
                  {result.validation?.schema_valid ? 'Syntax Valid' : 'Syntax Issues'}
                </div>
                <div className={`validation-check ${result.validation?.overall_status === 'PASS' ? 'pass' : 'loading'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                    {result.validation?.overall_status === 'PASS' ? 'check_circle' : 'warning'}
                  </span>
                  {result.validation?.overall_status === 'PASS' ? 'Schema Matched' : 'Review Required'}
                </div>
                <div className="validation-check pass">
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>check_circle</span>
                  PII Masked: {result.security?.pii_stats?.total_pii_found || 0}
                </div>
              </>
            ) : (
              <div className="validation-check loading">
                {loading ? (
                  <><div className="spinner" /> AI Validating...</>
                ) : (
                  'Awaiting input'
                )}
              </div>
            )}
          </div>
          <span className="validation-time">
            {result ? `Execution: ${(result.metadata?.generation_time_ms / 1000).toFixed(1)}s` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
