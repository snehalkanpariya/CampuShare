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
import Profile from './pages/Profile';

export default function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [lang, setLang] = useState('en');

  // Load existing session from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('campus_user');
    const savedToken = localStorage.getItem('campus_token');
    if (savedUser && savedToken) {
      try {
        const userObj = JSON.parse(savedUser);
        setCurrentUser({ ...userObj, verified: true });
        setCurrentView('dashboard');
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
      case 'dashboard':
      case 'listings':
      case 'hostel':
      case 'exchange-map':
        return <Dashboard currentUser={currentUser} onNavigate={setCurrentView} />;
      case 'profile':
        return <Profile currentUser={currentUser} />;
      default:
        return <Welcome onNavigate={setCurrentView} />;
    }
  };

  const showSidebar = ['dashboard', 'listings', 'hostel', 'exchange-map', 'profile'].includes(currentView);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-beige)' }}>
      <Navbar
        currentUser={currentUser}
        onNavigate={setCurrentView}
        lang={lang}
        setLang={setLang}
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
