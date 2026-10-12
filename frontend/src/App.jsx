import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RoleSwitcherBanner from './components/RoleSwitcherBanner';
import ToastNotification from './components/ToastNotification';
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
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import SafeExchange from './pages/SafeExchange';
import RequestsExchanges from './pages/RequestsExchanges';
import { DEMO_JUNIOR, DEMO_SENIOR } from './utils/demoUsers';
import { emitToast } from './utils/notificationStorage';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(DEMO_JUNIOR);
  const [verificationData, setVerificationData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [lang, setLang] = useState('en');

  // Load existing session from localStorage on startup, or start in Junior demo mode
  useEffect(() => {
    const savedUser = localStorage.getItem('campus_user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setCurrentUser({ ...userObj, verified: true });
        return;
      } catch (e) {
        localStorage.removeItem('campus_user');
      }
    }
    // Default to DEMO_JUNIOR so evaluation of View -> Request Item works immediately out of the box
    setCurrentUser(DEMO_JUNIOR);
    localStorage.setItem('campus_user', JSON.stringify(DEMO_JUNIOR));
  }, []);

  const handleSwitchUser = (newPersona) => {
    setCurrentUser(newPersona);
    localStorage.setItem('campus_user', JSON.stringify(newPersona));
    emitToast({
      title: `Switched to ${newPersona.name}`,
      message: `Active persona: ${newPersona.role} • ${newPersona.department}`,
      type: 'info'
    });
  };

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
        return <Dashboard currentUser={currentUser} onNavigate={setCurrentView} onSwitchUser={handleSwitchUser} />;
      case 'requests':
        return <RequestsExchanges currentUser={currentUser} onNavigate={setCurrentView} onSwitchUser={handleSwitchUser} />;
      case 'listings':
        return <MyListings currentUser={currentUser} onNavigate={setCurrentView} />;
      case 'hostel':
      case 'exchange-map':
        return <SafeExchange currentUser={currentUser} onNavigate={setCurrentView} />;
      case 'profile':
        return <Profile currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} onNavigate={setCurrentView} onSwitchUser={handleSwitchUser} />;
    }
  };

  const showSidebar = ['dashboard', 'requests', 'listings', 'hostel', 'exchange-map', 'profile'].includes(currentView);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-beige)' }}>
      {/* Floating Real-time Toast Notifications */}
      <ToastNotification onNavigate={setCurrentView} />

      {/* Main Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onNavigate={setCurrentView}
        onSwitchUser={handleSwitchUser}
        lang={lang}
        setLang={setLang}
      />

      {/* Interactive Role Switcher & Flow Bar */}
      {showSidebar && (
        <RoleSwitcherBanner
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onNavigate={setCurrentView}
        />
      )}

      {/* App Body with Sidebar & Main Content */}
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
