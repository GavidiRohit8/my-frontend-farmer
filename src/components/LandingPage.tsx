import React from 'react';
import { Sprout, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onAuthClick: (type: 'farmer' | 'buyer', mode: 'login' | 'register') => void;
}

export default function LandingPage({ onAuthClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-green-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">AgriMarket</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onAuthClick('farmer', 'login')}
                className="px-4 py-2 text-green-700 hover:text-green-800 transition-colors duration-200 font-medium"
              >
                Farmer Login
              </button>
              <button
                onClick={() => onAuthClick('buyer', 'login')}
                className="px-4 py-2 text-green-700 hover:text-green-800 transition-colors duration-200 font-medium"
              >
                Buyer Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-green-800 mb-6 leading-tight">
              Direct Farm
              <span className="block text-emerald-600">to Table</span>
            </h1>
            <p className="text-xl text-green-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect farmers directly with buyers through our transparent auction platform. 
              Fair pricing, no middlemen, fresh produce delivered with trust.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-green-200/50 hover:shadow-2xl transition-all duration-300 group">
                <h3 className="text-2xl font-bold text-green-800 mb-4">For Farmers</h3>
                <p className="text-green-600 mb-6">Sell your produce directly to buyers with fair auction pricing</p>
                <div className="space-y-3">
                  <button
                    onClick={() => onAuthClick('farmer', 'register')}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 group-hover:scale-105 transform transition-transform"
                  >
                    <span>Join as Farmer</span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => onAuthClick('farmer', 'login')}
                    className="w-full px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors duration-200 font-semibold"
                  >
                    Login
                  </button>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-emerald-200/50 hover:shadow-2xl transition-all duration-300 group">
                <h3 className="text-2xl font-bold text-emerald-800 mb-4">For Buyers</h3>
                <p className="text-emerald-600 mb-6">Access fresh produce directly from local farmers through auctions</p>
                <div className="space-y-3">
                  <button
                    onClick={() => onAuthClick('buyer', 'register')}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 group-hover:scale-105 transform transition-transform"
                  >
                    <span>Join as Buyer</span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => onAuthClick('buyer', 'login')}
                    className="w-full px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors duration-200 font-semibold"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">Why Choose AgriMarket?</h2>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Empowering farmers and connecting communities through transparent, fair trade
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Direct Connection</h3>
              <p className="text-green-600">No middlemen, farmers connect directly with buyers for better profits</p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Fair Pricing</h3>
              <p className="text-emerald-600">Transparent auction system ensures competitive and fair market prices</p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Secure Platform</h3>
              <p className="text-green-600">Safe and secure transactions with verified users and protected payments</p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-teal-200/50 hover:shadow-xl transition-all duration-300 text-center group">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Sprout className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-teal-800 mb-2">Fresh Produce</h3>
              <p className="text-teal-600">Access to the freshest agricultural products directly from local farms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800/90 backdrop-blur-md text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sprout className="h-8 w-8" />
              <span className="text-2xl font-bold">AgriMarket</span>
            </div>
            <p className="text-green-200 mb-4">Connecting farmers and buyers for a sustainable future</p>
            <p className="text-green-300 text-sm">© 2025 AgriMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}