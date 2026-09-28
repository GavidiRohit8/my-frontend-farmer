import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import './index.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'farmer' | 'buyer'>('farmer');

  const handleAuthClick = (type: 'farmer' | 'buyer', mode: 'login' | 'register') => {
    setUserType(type);
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-green-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-green-800">AgriMarket</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <User size={20} />
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm text-green-600 capitalize">({user.type})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        {user.type === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />}
      </div>
    );
  }

  return (
    <>
      <LandingPage onAuthClick={handleAuthClick} />
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          userType={userType}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <AppContent />
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;