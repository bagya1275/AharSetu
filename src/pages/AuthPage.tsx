import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Mail, Lock, User as UserIcon, Phone, Building, ArrowRight, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LogoMark } from '../components/LogoMark.js';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const resUser = await login(email, password);
        if (resUser) {
          const redirectTarget = sessionStorage.getItem('post_login_redirect');
          if (redirectTarget) {
            sessionStorage.removeItem('post_login_redirect');
            onNavigate(redirectTarget);
          } else if (resUser.role === 'admin') {
            onNavigate('admin-dashboard');
          } else if (resUser.role && resUser.role !== 'unassigned') {
            if (resUser.role === 'donor') onNavigate('donor-dashboard');
            else if (resUser.role === 'ngo') onNavigate('ngo-dashboard');
            else if (resUser.role === 'requester') onNavigate('requester-dashboard');
            else if (resUser.role === 'volunteer') onNavigate('volunteer-dashboard');
            else onNavigate('home');
          } else {
            onNavigate('role-selection');
          }
        } else {
          setError('Invalid credentials or user account not found.');
        }
      } else if (mode === 'signup') {
        if (!name || !email) {
          setError('Name and Email are required.');
          setLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError('Please enter a valid email address (e.g. name@domain.com).');
          setLoading(false);
          return;
        }

        const cleanPhoneDigits = phone.replace(/\D/g, '');
        if (!phone || cleanPhoneDigits.length !== 10) {
          setError('Please enter a valid 10-digit mobile number.');
          setLoading(false);
          return;
        }

        const resUser = await register({
          name,
          email,
          password: password || 'defaultpass123',
          role: 'unassigned',
          phone: phone || '+91 98000 00000',
          organization: organization || name,
          address: address || 'New Delhi, India'
        });

        if (resUser) {
          const redirectTarget = sessionStorage.getItem('post_login_redirect');
          if (redirectTarget) {
            sessionStorage.removeItem('post_login_redirect');
            onNavigate(redirectTarget);
          } else if (resUser.role === 'admin') {
            onNavigate('admin-dashboard');
          } else {
            onNavigate('role-selection');
          }
        } else {
          setError('Registration failed. Email might already exist.');
        }
      } else if (mode === 'forgot') {
        if (!email || !newPassword) {
          setError('Email and new password are required.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        const res = await resetPassword(email, newPassword);
        if (res.success) {
          setSuccessMessage(res.message);
          setMode('login');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F9FBFA] dark:bg-slate-950">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Visual Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1A2E22] via-[#15803D] to-[#16A34A] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="space-y-6 relative z-10">
            <div className="mb-2">
              <LogoMark size="lg" variant="dark" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Step 1 of 3: Authentication
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Join India's Zero Food Waste Network
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Connect hotels, caterers, and households with verified local shelters and express volunteers in under 60 seconds.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Real-time surplus food dispatch</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Instant 80G tax receipt generation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Verified food safety & freshness standards</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 text-[11px] text-emerald-100/80 flex items-center justify-between">
            <span>100% Free Platform</span>
            <span className="font-bold">AharSetu Direct</span>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-center">
          
          {/* Header & Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-[#16A34A] shadow-xs'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-[#16A34A] shadow-xs'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
              </div>

              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {mode === 'signup' ? 'New User' : mode === 'login' ? 'Existing Member' : 'Reset Password'}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white">
                {mode === 'signup'
                  ? 'Sign up to start saving food'
                  : mode === 'login'
                  ? 'Welcome back to AharSetu'
                  : 'Reset Your Account Password'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {mode === 'signup'
                  ? 'Fill in your details below to create your profile and choose your role.'
                  : mode === 'login'
                  ? 'Enter your credentials to access your rescue portal.'
                  : 'Enter your registered email address and set a new password for your account.'}
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                  Full Name / Organization Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radisson Blu / Ananya Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@organization.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#111827] dark:text-slate-200">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setSuccessMessage(null); }}
                      className="text-[11px] font-bold text-[#16A34A] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
            )}

            {mode === 'forgot' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                    Mobile Number (10 Digits)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                      }}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                    City / Address
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Connaught Place, New Delhi"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl font-bold text-xs shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signup'
                      ? 'Proceed to Role Selection (Step 2)'
                      : mode === 'login'
                      ? 'Sign In to Portal'
                      : 'Update Password'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

        </div>

      </div>
    </div>
  );
};
