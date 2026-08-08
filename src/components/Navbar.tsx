import React from 'react';
import { User, UserRole } from '../types/index.js';
import { Sun, Moon, LogOut, ChevronDown, LayoutDashboard, HeartHandshake, Award, Users } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenModal: (view: 'mission' | 'impact' | 'ngos') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeRole,
  onSelectRole,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme,
  onOpenModal
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const roleLabels: Record<UserRole, string> = {
    UNASSIGNED: 'Role Unassigned',
    DONOR: 'Food Donor',
    NGO: 'NGO Rescuer',
    VOLUNTEER: 'Volunteer Hero',
    REQUESTER: 'Food Requester',
    ADMIN: 'Platform Admin'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#080c14]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 md:px-8 py-3 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            A
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">AharSetu</span>
            </div>
            <p className="text-[10px] tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Smart Redistribution</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button 
            id="nav_mission_btn"
            onClick={() => onOpenModal('mission')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-emerald-500" />
            <span>Our Mission</span>
          </button>
          <button 
            id="nav_impact_btn"
            onClick={() => onOpenModal('impact')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Live Impact</span>
          </button>
          <button 
            id="nav_ngos_btn"
            onClick={() => onOpenModal('ngos')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Verified NGOs</span>
          </button>
          {user && (
            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </div>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="relative">
              <button
                id="user_profile_dropdown_btn"
                data-testid="user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-full text-xs font-medium transition shadow-sm cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-900 dark:text-white max-w-[120px] truncate">{user.name}</span>
                <span className="text-slate-500 dark:text-slate-400">({roleLabels[activeRole] || activeRole})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  
                  <p className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Switch Role View</p>
                  <button
                    id="switch_role_donor"
                    onClick={() => { onSelectRole('DONOR'); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-between cursor-pointer ${activeRole === 'DONOR' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span>Food Donor</span>
                    {activeRole === 'DONOR' && <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                  <button
                    id="switch_role_ngo"
                    onClick={() => { onSelectRole('NGO'); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-between cursor-pointer ${activeRole === 'NGO' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span>NGO Rescuer</span>
                    {activeRole === 'NGO' && <span className="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                  <button
                    id="switch_role_volunteer"
                    onClick={() => { onSelectRole('VOLUNTEER'); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-between cursor-pointer ${activeRole === 'VOLUNTEER' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span>Volunteer Hero</span>
                    {activeRole === 'VOLUNTEER' && <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                  <button
                    id="switch_role_requester"
                    onClick={() => { onSelectRole('REQUESTER'); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-between cursor-pointer ${activeRole === 'REQUESTER' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span>Food Requester</span>
                    {activeRole === 'REQUESTER' && <span className="text-[10px] bg-orange-500/30 px-1.5 py-0.5 rounded">Active</span>}
                  </button>

                  {(user.email.toLowerCase().trim() === 'bagya1725@gmail.com' || user.role === 'ADMIN') && (
                    <button
                      id="switch_role_admin"
                      onClick={() => { onSelectRole('ADMIN'); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-between cursor-pointer ${activeRole === 'ADMIN' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-purple-700 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <span>Platform Admin</span>
                      {activeRole === 'ADMIN' && <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded">Active</span>}
                    </button>
                  )}

                  <div className="border-t border-slate-200 dark:border-slate-800 mt-1 pt-1">
                    <button
                      id="logout_btn"
                      onClick={() => { onLogout(); setDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium transition flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="auth_signin_btn"
              data-testid="signin-modal-trigger"
              onClick={onOpenAuth}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-100 px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle Button */}
          <button
            id="theme_toggle_btn"
            onClick={onToggleTheme}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs hover:border-amber-500/50 transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-slate-700 font-medium">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
