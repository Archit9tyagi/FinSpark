export default function Navbar({ activePage, onNavigate }) {
  const pages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'generator', label: 'Generator' },
    { id: 'templates', label: 'Templates' },
    { id: 'compliance', label: 'Compliance' },
  ];

  return (
    <nav className="nav">
      <div className="flex items-center gap-6">
        <div className="nav-brand">
          <div className="nav-brand-icon">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <span className="nav-brand-name">FinSpark AI</span>
        </div>
        <div className="nav-links">
          {pages.map(p => (
            <button
              key={p.id}
              className={`nav-link ${activePage === p.id ? 'active' : ''}`}
              onClick={() => onNavigate(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-status">
          <div className="nav-status-dot"></div>
          <span className="nav-status-text">Live System</span>
        </div>
        <div className="nav-zta">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="nav-zta-text">ZTA Active</span>
        </div>
      </div>
    </nav>
  );
}
