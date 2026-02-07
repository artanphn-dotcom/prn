import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Apartments } from './pages/Apartments';
import { Tenants } from './pages/Tenants';
import { Finance } from './pages/Finance';
import { Documents } from './pages/Documents';
import { AppProvider } from './contexts/AppContext';

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="apartments" element={<Apartments />} />
            <Route path="tenants" element={<Tenants />} />
            {/* Specific Finance Routes */}
            <Route path="rent-payments" element={<Finance />} />
            <Route path="family-support" element={<Finance />} />
            <Route path="apartment-expenses" element={<Finance />} />
            <Route path="personal-expenses" element={<Finance />} />
            <Route path="documents" element={<Documents />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;