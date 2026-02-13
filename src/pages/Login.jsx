import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import Button from '../components/common/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await usersAPI.getAll();
      const user = response.data.find(u => u.email === email);
      if (user) {
        login(user);
        navigate(user.type === 'creator' ? '/creator/dashboard' : '/investor/dashboard');
      } else {
        setError('Invalid credentials. Try: amara.okoro@example.com or kwame.mensah@example.com');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail) => {
    setEmail(userEmail);
    setPassword('demo123');
    setTimeout(() => {
      document.getElementById('login-form')?.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-16 lg:p-20 bg-gradient-to-br from-[#FFF8F0] to-white relative overflow-hidden">
      {/* Original ::before overlay with radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(200,75,49,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(212,165,116,0.05)_0%,transparent_50%)] pointer-events-none" />

      {/* Container – max-w-[480px] exactly like original */}
      <div className="relative z-10 w-full max-w-[480px]">
        {/* Card – padding: 4rem (var(--space-2xl)), border-radius: 20px, shadow-xl, border neutral-200 */}
        <div className="bg-white p-16 rounded-[20px] shadow-[0_24px_48px_rgba(0,0,0,0.15)] border border-[#E7E5E4]">
          
          {/* Header – margin-bottom: var(--space-xl) = 3rem */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-[#C84B31] to-[#A0522D] bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-[#57534E] text-base">Login to your InnovateBridge account</p>
          </div>

          {/* Error – exactly as original: bg-primary/10, border-primary, text-primary, padding var(--space-md) = 1.5rem, rounded-md = 8px */}
          {error && (
            <div className="bg-[#C84B31]/10 border border-[#C84B31] text-[#C84B31] p-6 rounded-[8px] mb-8 text-sm leading-relaxed">
              {error}
            </div>
          )}

          {/* Form – spacing var(--space-lg) = 2rem between form groups */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="email" className="block font-display font-semibold text-sm text-[#44403C]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 text-base border-2 border-[#E7E5E4] rounded-[8px] focus:outline-none focus:border-[#C84B31] focus:ring-4 focus:ring-[#C84B31]/10 transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-display font-semibold text-sm text-[#44403C]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 text-base border-2 border-[#E7E5E4] rounded-[8px] focus:outline-none focus:border-[#C84B31] focus:ring-4 focus:ring-[#C84B31]/10 transition"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={loading}
              icon={<LogIn size={20} />}
              iconPosition="right"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Divider – exactly as original: flex items-center, text-center, margins var(--space-xl) = 3rem */}
          <div className="flex items-center text-center my-12">
            <div className="flex-1 border-t border-[#E7E5E4]" />
            <span className="px-4 font-display font-semibold text-xs uppercase tracking-wider text-[#A8A29E]">
              Demo Accounts (For Pitch)
            </span>
            <div className="flex-1 border-t border-[#E7E5E4]" />
          </div>

          {/* Demo buttons – exactly as original: flex-col gap var(--space-md) = 1.5rem */}
          <div className="flex flex-col gap-6">
            <button
              onClick={() => quickLogin('amara.okoro@example.com')}
              className="flex items-center gap-6 p-6 bg-[#FAFAF9] border-2 border-[#E7E5E4] rounded-[8px] hover:bg-white hover:border-[#C84B31] hover:shadow-md transition-all text-left"
            >
              <img
                src="https://i.pravatar.cc/48?img=1"
                alt="Creator"
                className="w-12 h-12 rounded-full border-2 border-[#C84B31] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <strong className="block font-display font-bold text-base text-[#1C1917] mb-0.5 truncate">
                  Creator Account
                </strong>
                <span className="text-sm text-[#57534E] truncate block">
                  Amara Okoro - AgroConnect
                </span>
              </div>
            </button>

            <button
              onClick={() => quickLogin('kwame.mensah@example.com')}
              className="flex items-center gap-6 p-6 bg-[#FAFAF9] border-2 border-[#E7E5E4] rounded-[8px] hover:bg-white hover:border-[#C84B31] hover:shadow-md transition-all text-left"
            >
              <img
                src="https://i.pravatar.cc/48?img=12"
                alt="Investor"
                className="w-12 h-12 rounded-full border-2 border-[#C84B31] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <strong className="block font-display font-bold text-base text-[#1C1917] mb-0.5 truncate">
                  Investor Account
                </strong>
                <span className="text-sm text-[#57534E] truncate block">
                  Kwame Mensah - Angel Investor
                </span>
              </div>
            </button>
          </div>

          {/* Footer – padding-top var(--space-lg) = 2rem, border-t neutral-200 */}
          <div className="mt-12 pt-8 text-center border-t border-[#E7E5E4]">
            <p className="text-sm text-[#57534E]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#C84B31] font-semibold hover:text-[#A03825] hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;