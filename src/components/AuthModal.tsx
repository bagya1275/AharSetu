import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types.js';
import { Mail, Lock, User as UserIcon, Phone, MapPin, Building, X, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signup',
  onSuccess
}) => {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const resUser = await login(email, password);
        if (resUser) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setError('Invalid login credentials or user not found.');
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
          password,
          role: 'unassigned', // Explicitly defaults to UNASSIGNED so role selection modal intercepts next
          phone: phone || '+91 98000 00000',
          organization,
          address: address || 'New Delhi, NCR'
        });

        if (resUser) {
          if (onSuccess) onSuccess();
          onClose();
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
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative"
          >
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/50 text-[11px] font-bold text-[#16A34A] uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" />
            100% Free Food Redistribution
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827] dark:text-white">
            {mode === 'login' ? 'Welcome Back to AharSetu' : mode === 'signup' ? 'Create an Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {mode === 'login' 
              ? 'Enter your registered email to access your rescue portal' 
              : mode === 'signup'
              ? 'Sign up to post surplus food or claim donations for your shelter'
              : 'Enter your email and a new password to recover access'}
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                Full Name / Organization Contact
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
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
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
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
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                  Mobile Number (10 Digits)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                  Organization Name (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Grand Catering / Annam Trust"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-slate-200 mb-1">
                  Address / City Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Connaught Place, New Delhi"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 rounded-xl text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Log In to Account' : mode === 'signup' ? 'Register Account' : 'Update Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle mode link */}
        <div className="text-center pt-2 border-t border-[#E8EEEA] dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 space-y-1">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
                className="font-bold text-[#16A34A] hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="font-bold text-[#16A34A] hover:underline"
              >
                Log In
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
              className="font-bold text-[#16A34A] hover:underline"
            >
              ← Back to Sign In
            </button>
          )}
        </div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
