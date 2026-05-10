import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DomainProvider } from './context/DomainContext';
import PageShell from './components/layout/PageShell';
import HeroSection from './components/landing/HeroSection';
import Dashboard from './pages/Dashboard';
import Inference from './pages/Inference';
import DomainDetail from './pages/DomainDetail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <DomainProvider>
      <Router>
        <Routes>
          {/* Landing page has its own layout without navbar */}
          <Route path="/" element={<HeroSection />} />
          
          {/* Other pages use the PageShell */}
          <Route path="/dashboard" element={<PageShell><Dashboard /></PageShell>} />
          <Route path="/inference" element={<PageShell><Inference /></PageShell>} />
          <Route path="/domain" element={<PageShell><DomainDetail /></PageShell>} />
          <Route path="/settings" element={<PageShell><Settings /></PageShell>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </DomainProvider>
  );
}
