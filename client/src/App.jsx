import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Templates from './pages/Templates';
import Compliance from './pages/Compliance';
import Footer from './components/Footer';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'generator': return <Generator />;
      case 'templates': return <Templates />;
      case 'compliance': return <Compliance />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="page-content container space-y-24">
        {renderPage()}
      </main>
      <Footer />
    </>
  );
}

export default App;
