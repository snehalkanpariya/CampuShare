import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Welcome from './pages/Welcome';
import RoleSelect from './pages/RoleSelect';
import JuniorRegister from './pages/JuniorRegister';
import JuniorOtpVerify from './pages/JuniorOtpVerify';
import SeniorRegister from './pages/SeniorRegister';
import SeniorMarksheetUpload from './pages/SeniorMarksheetUpload';
import VerificationResult from './pages/VerificationResult';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import HostelPickups from './pages/HostelPickups';
import SafeExchange from './pages/SafeExchange';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { parseJwtToken, getUserRolesFromToken } from './config/keycloak';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { INITIAL_CAMPUS_ITEMS } from './data/mockItems';

function MainLayout() {
  const [currentView, setCurrentView] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Shared listings store with persistent storage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignored
    }
    return INITIAL_CAMPUS_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('campus_items', JSON.stringify(items));
    } catch (e) {
      // Ignored
    }
  }, [items]);

  // Handle Admin rule-violation delete or student delete
  const handleDeleteItem = (itemId, reason) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Handle new item listing
  const handleAddItem = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  // Load existing session from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('campus_user');
    const savedToken = localStorage.getItem('campus_token');
    if (savedUser && savedToken) {
      try {
        const userObj = JSON.parse(savedUser);
        const roles = getUserRolesFromToken(savedToken);
        setCurrentUser({
          ...userObj,
          roles: roles,
          role: roles.includes('ADMIN') ? 'ADMIN' : (userObj.role || 'STUDENT'),
          verified: true
        });
        setCurrentView(roles.includes('ADMIN') ? 'admin-dashboard' : 'dashboard');
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setVerificationData(null);
    setResultData(null);
    setCurrentView('welcome');
  };

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome onNavigate={setCurrentView} />;
      case 'role-select':
        return <RoleSelect onNavigate={setCurrentView} />;
      case 'junior-register':
        return <JuniorRegister onNavigate={setCurrentView} setVerificationData={setVerificationData} />;
      case 'junior-otp':
        return <JuniorOtpVerify verificationData={verificationData} onNavigate={setCurrentView} setResultData={setResultData} />;
      case 'senior-register':
        return <SeniorRegister onNavigate={setCurrentView} setVerificationData={setVerificationData} />;
      case 'senior-upload':
        return <SeniorMarksheetUpload verificationData={verificationData} onNavigate={setCurrentView} setResultData={setResultData} />;
      case 'verification-result':
        return <VerificationResult resultData={resultData} onNavigate={setCurrentView} />;
      case 'login':
        return <Login onNavigate={setCurrentView} setCurrentUser={setCurrentUser} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={setCurrentView} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentView} onLogout={handleLogout} />;
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            onNavigate={setCurrentView}
            items={items}
            onDeleteItem={handleDeleteItem}
          />
        );
      case 'listings':
        return (
          <Listings
            currentUser={currentUser}
            items={items}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        );
      case 'hostel':
        return (
          <HostelPickups
            currentUser={currentUser}
            items={items}
            onDeleteItem={handleDeleteItem}
          />
        );
      case 'exchange-map':
        return <SafeExchange currentUser={currentUser} />;
      case 'profile':
        return <Profile currentUser={currentUser} />;
      default:
        return <Welcome onNavigate={setCurrentView} />;
    }
  };

  const showSidebar = ['dashboard', 'listings', 'hostel', 'exchange-map', 'profile', 'admin-dashboard'].includes(currentView);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-beige)' }}>
      <Navbar
        currentUser={currentUser}
        onNavigate={setCurrentView}
      />

      <div style={{ flex: 1, display: 'flex' }}>
        {showSidebar && (
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        <main style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
}
