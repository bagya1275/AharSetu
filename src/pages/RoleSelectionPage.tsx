import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types.js';
import { Utensils, Building2, Truck, ShieldCheck, ArrowRight, CheckCircle2, HeartHandshake } from 'lucide-react';
import { LogoMark } from '../components/LogoMark.js';

interface RoleSelectionPageProps {
  onNavigate: (page: string) => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onNavigate }) => {
  const { user, setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmRole = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await setUserRole(selectedRole);
      if (success) {
        // Navigate directly to selected dashboard or home
        if (selectedRole === 'requester') {
          onNavigate('requester-dashboard');
        } else if (selectedRole === 'ngo') {
          onNavigate('ngo-dashboard');
        } else if (selectedRole === 'donor') {
          onNavigate('donor-dashboard');
        } else if (selectedRole === 'volunteer') {
          onNavigate('volunteer-dashboard');
        } else {
          onNavigate('home');
        }
      } else {
        setError('Failed to update user role. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during role assignment.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      id: 'donor' as UserRole,
      title: 'Food Donor',
      subtitle: 'Hotels, Caterers, Restaurants & Households',
      description: 'Log surplus meals in under 60 seconds with expiry tracking, food safety labels, and 80G tax receipt generation.',
      icon: Utensils,
      badge: 'Zero Food Waste',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
    },
    {
      id: 'ngo' as UserRole,
      title: 'NGO / Rescuer Organization',
      subtitle: 'Registered Food Banks & Relief Networks',
      description: 'Verified non-profits coordinating regional food distribution campaigns and large-scale surplus recovery operations.',
      icon: Building2,
      badge: 'Verified Non-Profit',
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
    },
    {
      id: 'requester' as UserRole,
      title: 'Food Requester / Beneficiary Shelter',
      subtitle: 'Orphanages, Old Age Homes, Slum Kitchens & Individuals',
      description: 'Request food for your shelter or browse surplus meals. Choose self-pickup or request volunteer delivery.',
      icon: HeartHandshake,
      badge: 'Direct Food Receiver',
      color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800'
    },
    {
      id: 'volunteer' as UserRole,
      title: 'Volunteer Rescue Hero',
      subtitle: 'Riders, Drivers & Local Advocates',
      description: 'Pick up verified surplus food with thermal bags and safely deliver meals to nearby orphanages and community centers.',
      icon: Truck,
      badge: 'Express Rescue',
      color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
    }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-[#F9FBFA] dark:bg-slate-950">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 rounded-2xl shadow-xl p-5 sm:p-7 space-y-5 relative overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1A2E22] via-[#16A34A] to-[#22C55E]" />

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <LogoMark size="sm" className="justify-center mb-2" />

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Step 2 of 3: User Role Setup
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] dark:text-white">
            {user?.role === 'admin' ? 'System Admin Account' : 'Select Your Role'}
          </h1>
          <p className="text-xs text-gray-600 dark:text-slate-300 max-w-md mx-auto">
            {user ? `Hello ${user.name}! ` : ''}
            {user?.role === 'admin' 
              ? 'You are logged in with the official System Administrator account.' 
              : 'Choose your role on AharSetu to customize your active workflow and dashboard.'}
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {user?.role === 'admin' ? (
          <div className="p-5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-center space-y-3">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-lg shadow-md">
              👑
            </div>
            <div>
              <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200">Authorized System Administrator</h3>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                Full platform oversight, NGO verification controls, and analytics access.
              </p>
            </div>
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Role Cards List */}
            <div className="space-y-2.5">
          {roleCards.map((rc) => {
            const Icon = rc.icon;
            const isSelected = selectedRole === rc.id;
            return (
              <button
                key={rc.id}
                type="button"
                onClick={() => setSelectedRole(rc.id)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-[#16A34A] bg-green-50/60 dark:bg-green-950/30 shadow-xs ring-2 ring-[#16A34A]/30'
                    : 'border-[#E8EEEA] dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${rc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-[#111827] dark:text-white flex items-center gap-1.5 truncate">
                      {rc.title}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 shrink-0">
                      {rc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#16A34A] dark:text-green-400">
                    {rc.subtitle}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-snug">
                    {rc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleConfirmRole}
            disabled={loading}
            className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl font-bold text-xs shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Saving Role...</span>
            ) : (
              <>
                <span>Continue to Homepage as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400">
            You can switch views anytime from the top navigation bar.
          </p>
        </div>
        </>
        )}

      </div>
    </div>
  );
};
