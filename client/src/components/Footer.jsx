export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="space-y-6">
            <div className="nav-brand">
              <div className="nav-brand-icon" style={{ width: '1.25rem', height: '1.25rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.625rem', fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-container)' }}>FinSpark AI</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--outline)', lineHeight: 1.7, maxWidth: '20rem' }}>
              Enterprise-grade configuration synthesis for the modern core banking engine. Zero-trust by design, AI-powered by necessity.
            </p>
          </div>
          <div>
            <h5 className="footer-section-title">Quick Navigation</h5>
            <ul className="footer-links">
              <li><a className="footer-link" href="#">Documentation Portal</a></li>
              <li><a className="footer-link" href="#">API Reference</a></li>
              <li><a className="footer-link" href="#">Compliance Certs</a></li>
              <li><a className="footer-link" href="#">Audit Logs</a></li>
            </ul>
          </div>
          <div>
            <h5 className="footer-section-title">System Registry</h5>
            <ul className="footer-links">
              <li><a className="footer-link" href="#">FIPS Vault Status</a></li>
              <li><a className="footer-link" href="#">RBI Data Locality</a></li>
              <li><a className="footer-link" href="#">Model Transparency</a></li>
              <li><a className="footer-link" href="#">Network Health</a></li>
            </ul>
          </div>
          <div>
            <h5 className="footer-section-title">Live Status</h5>
            <div className="space-y-4">
              <div className="footer-status-item"><span>Core Generator</span><span className="footer-status-value">OPERATIONAL</span></div>
              <div className="footer-status-item"><span>AI Inference</span><span className="footer-status-value">OPERATIONAL</span></div>
              <div className="footer-status-item"><span>Security Engine</span><span className="footer-status-value">OPERATIONAL</span></div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <span>© 2026 FinSpark AI. Enterprise Grade.</span>
            <a href="#">Security Policy</a>
            <a href="#">System Status</a>
            <a href="#">Audit Trail</a>
          </div>
          <div className="footer-tagline">
            ZERO TRUST. ALWAYS VERIFIED. ALWAYS SECURE.
          </div>
        </div>
      </div>
    </footer>
  );
}
