import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { UserRole } from '../types.js';
import { LogoMark } from './LogoMark.js';
import { 
  Heart, 
  Sun, 
  Moon, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X,
  Truck,
  Building2,
  LayoutDashboard,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenNotifications?: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  onNavigate, 
  onOpenAuthModal
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    unassigned: { label: 'Select Role', bg: 'bg-gray-100 dark:bg-slate-800', text: 'text-gray-700 dark:text-slate-300' },
    donor: { label: 'Food Donor', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300' },
    ngo: { label: 'NGO Rescuer', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300' },
    requester: { label: 'Food Requester', bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-800 dark:text-orange-300' },
    volunteer: { label: 'Volunteer Hero', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
    admin: { label: 'System Admin', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300' },
  };

  const currentRoleInfo = user ? roleLabels[user.role] : roleLabels.unassigned;

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-[#E8EEEA] dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="cursor-pointer group hover:opacity-95 transition-all"
        >
          <LogoMark size="md" showText={true} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#4B5563] dark:text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors ${currentPage === 'home' ? 'text-[#16A34A] font-bold' : 'hover:text-[#16A34A]'}`}
          >
            Our Mission
          </button>
          
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors ${currentPage === 'about' ? 'text-[#16A34A] font-bold' : 'hover:text-[#16A34A]'}`}
          >
            Live Impact
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className={`transition-colors ${currentPage === 'leaderboard' ? 'text-[#16A34A] font-bold' : 'hover:text-[#16A34A]'}`}
          >
            Verified NGOs
          </button>

          {/* Role specific Dashboard shortcut */}
          {user && user.role !== 'unassigned' && (
            <button
              onClick={() => onNavigate(`${user.role}-dashboard`)}
              className={`transition-colors flex items-center gap-1.5 ${currentPage.includes('dashboard') ? 'text-[#16A34A] font-bold' : 'hover:text-[#16A34A]'}`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#16A34A]" />
              Dashboard
            </button>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden sm:flex items-center gap-3">
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8EEEA] dark:border-slate-800 ${currentRoleInfo.bg} ${currentRoleInfo.text} text-xs font-bold transition-all hover:opacity-90 shadow-xs`}
              >
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span className="truncate max-w-[120px]">{user.name}</span>
                <span className="opacity-60 text-[11px] hidden lg:inline">({currentRoleInfo.label})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 mb-1">
                    Logged in as {user.name}
                  </div>

                  <button
                    onClick={() => { 
                      setRoleDropdownOpen(false); 
                      if (user.role === 'donor') onNavigate('donor-dashboard');
                      else if (user.role === 'ngo') onNavigate('ngo-dashboard');
                      else if (user.role === 'requester') onNavigate('requester-dashboard');
                      else if (user.role === 'volunteer') onNavigate('volunteer-dashboard');
                      else if (user.role === 'admin') onNavigate('admin-dashboard');
                      else onNavigate('role-select');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-green-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#16A34A]" />
                    {user.role === 'unassigned' ? 'Select Role' : 'My Active Dashboard'}
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setRoleDropdownOpen(false); onNavigate('admin-dashboard'); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Admin Control Panel
                    </button>
                  )}

                  {user.role !== 'admin' && (
                    <button
                      onClick={() => { setRoleDropdownOpen(false); onNavigate('role-selection'); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Change User Role
                    </button>
                  )}

                  <div className="border-t border-gray-100 dark:border-slate-800 my-1" />

                  <button
                    onClick={() => { logout(); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl border border-[#E8EEEA] dark:border-slate-800 text-xs font-bold text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#16A34A]" />
              Sign In / Register
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded-xl border border-[#E8EEEA] dark:border-slate-800 text-xs font-bold text-[#4B5563] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs"
            title="Switch between Light and Dark theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span className="hidden md:inline text-[11px] font-bold text-amber-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 fill-slate-700/20" />
                <span className="hidden md:inline text-[11px] font-bold text-slate-700">Dark</span>
              </>
            )}
          </button>

        </div>

        {/* Mobile menu trigger & Theme Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
          >
            About
          </button>
          <button
            onClick={() => { onNavigate('leaderboard'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
          >
            Leaderboard
          </button>
          {user && user.role !== 'unassigned' ? (
            <button
              onClick={() => { onNavigate(`${user.role}-dashboard`); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 font-bold text-sm text-emerald-700 dark:text-emerald-400"
            >
              {user.role.toUpperCase()} Dashboard
            </button>
          ) : (
            <button
              onClick={() => { if (onOpenAuthModal) onOpenAuthModal(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 font-bold text-sm text-emerald-700 dark:text-emerald-400"
            >
              Sign In / Register
            </button>
          )}
          <button
            onClick={() => { onNavigate('post-donation'); setMobileMenuOpen(false); }}
            className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-center text-sm shadow-md"
          >
            Donate Surplus Food
          </button>
        </div>
      )}
    </header>
  );
};
