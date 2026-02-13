import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import { clsx } from 'clsx';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-4 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-2xl text-neutral-900 hover:scale-105 transition-transform">
            <span className="text-3xl">🌉</span>
            <span className="bg-gradient-to-r from-primary to-clay bg-clip-text text-transparent">
              Kairon
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/discover" className="flex items-center gap-1 font-display font-semibold text-neutral-700 hover:text-primary px-2 py-1.5 rounded-md transition-all">
              <Compass size={18} />
              Discover
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={user?.type === 'creator' ? '/creator/dashboard' : '/investor/dashboard'} 
                  className="flex items-center gap-1 font-display font-semibold text-neutral-700 hover:text-primary px-2 py-1.5 rounded-md transition-all"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-md">
                  <img 
                    src={user?.profile?.photo || 'https://i.pravatar.cc/40'} 
                    alt={user?.profile?.fullName}
                    className="w-8 h-8 rounded-full border-2 border-primary object-cover"
                  />
                  <span className="font-display font-semibold text-sm text-neutral-900">
                    {user?.profile?.fullName}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="p-1.5 text-neutral-600 hover:text-primary hover:bg-white rounded-sm transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="small">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="small">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-neutral-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col gap-1 py-4 mt-4 border-t border-neutral-200">
            <Link 
              to="/discover" 
              className="flex items-center gap-2 p-4 font-display font-semibold text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-md transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <Compass size={18} />
              Discover
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={user?.type === 'creator' ? '/creator/dashboard' : '/investor/dashboard'} 
                  className="flex items-center gap-2 p-4 font-display font-semibold text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-md transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 p-4 font-display font-semibold text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-md transition-all text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 p-4 font-display font-semibold text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-md transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center gap-2 p-4 font-display font-semibold text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-md transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;