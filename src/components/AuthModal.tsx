import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { User } from '../types/index.ts';
import { CheckCircle, X, ArrowRight, User as UserIcon, Mail, Lock, Phone, MapPin } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName || !email || !password) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }

        const res = await api.register({
          name: fullName,
          email,
          password,
          phone,
          address
        });

        if (!res.success) {
          setError(res.message || 'Registration failed');
          setLoading(false);
          return;
        }

        localStorage.setItem('aharsetu_token', res.token);
        onAuthSuccess(res.user, res.token);
      } else {
        if (!email || !password) {
          setError('Please enter your email and password');
          setLoading(false);
          return;
        }

        const res = await api.login({ email, password });

        if (!res.success) {
          setError(res.message || 'Login failed');
          setLoading(false);
          return;
        }

        localStorage.setItem('aharsetu_token', res.token);
        onAuthSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        id="auth_modal_container"
        data-testid="auth-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 my-8"
      >
        {/* Close Button */}
        <button
          id="close_auth_modal_btn"
          data-testid="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Green Feature Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-emerald-700 text-xl shadow-md">
                A
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight">AharSetu</span>
                <p className="text-[9px] tracking-widest uppercase font-semibold text-emerald-200">Smart Redistribution</p>
              </div>
            </div>

            {/* Step Tag */}
            <div className="inline-block px-3 py-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase text-emerald-100">
              STEP 1 OF 3: AUTHENTICATION
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight">
              Join India's Zero Food Waste Network
            </h2>

            <p className="text-emerald-100 text-xs leading-relaxed">
              Connect hotels, caterers, and households with verified local shelters and express volunteers in under 60 seconds.
            </p>

            <ul className="space-y-3 text-xs font-medium text-emerald-50 pt-2">
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Real-time surplus food dispatch</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Instant 80G tax receipt generation</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Verified food safety & freshness standards</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 border-t border-emerald-500/30 flex items-center justify-between text-[11px] text-emerald-200 font-medium">
            <span>100% Free Platform</span>
            <span>AharSetu Direct</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:col-span-7 p-6 md:p-8 bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex flex-col justify-center">
          {/* Top Toggle Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex space-x-1 shadow-sm">
              <button
                id="tab_signup"
                data-testid="tab-signup"
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${isSignUp ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Create Account
              </button>
              <button
                id="tab_signin"
                data-testid="tab-signin"
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${!isSignUp ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Sign In
              </button>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
              {isSignUp ? 'NEW USER' : 'WELCOME BACK'}
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
            {isSignUp ? 'Sign up to start saving food' : 'Sign in to your account'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
            {isSignUp ? 'Fill in your details below to create your profile and choose your role.' : 'Enter your credentials to access your dashboard.'}
          </p>

          {error && (
            <div 
              id="auth_error_msg"
              data-testid="auth-error-msg"
              className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name / Organization Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input_fullname"
                    data-testid="input-fullname"
                    key="input_fullname"
                    type="text"
                    required={isSignUp}
                    placeholder="e.g. Radisson Blu / Ananya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input_email"
                  data-testid="input-email"
                  key="input_email"
                  type="email"
                  required
                  placeholder="e.g. contact@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input_password"
                  data-testid="input-password"
                  key="input_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Number (10 Digits)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="input_phone"
                      data-testid="input-phone"
                      key="input_phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    City / Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="input_address"
                      data-testid="input-address"
                      key="input_address"
                      type="text"
                      placeholder="Connaught Place, New Delhi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              id="auth_submit_btn"
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Proceed to Role Selection (Step 2)' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
