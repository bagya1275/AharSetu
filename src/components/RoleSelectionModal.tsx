import React, { useState } from 'react';
import { UserRole, User } from '../types/index.js';
import { api } from '../services/api.js';
import { UtensilsCrossed, Building2, Bike, HeartHandshake, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  user: User;
  onRoleSet: (updatedUser: User) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, user, onRoleSet }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('DONOR');
  const [shelterLocation, setShelterLocation] = useState('Lajpat Nagar IV, New Delhi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirmRole = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.setRole(selectedRole, shelterLocation);
      if (!res.success) {
        setError(res.message || 'Failed to update role');
        setLoading(false);
        return;
      }

      if (res.token) {
        localStorage.setItem('aharsetu_token', res.token);
      }

      onRoleSet(res.user);
    } catch (err: any) {
      setError(err.message || 'Error assigning role');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'DONOR' as UserRole,
      title: 'Food Donor / Partner',
      subtitle: 'Hotels, Banquets, Restaurants, Corporate Cafeterias & Individuals',
      desc: 'Post fresh extra surplus food in seconds for instant local shelter rescue.',
      icon: UtensilsCrossed,
      color: 'emerald',
      badge: 'Donation Dispatch'
    },
    {
      id: 'NGO' as UserRole,
      title: 'NGO & Shelter Rescuer',
      subtitle: 'Verified Non-Profits, Orphanages, Night Shelters & Feeding Programs',
      desc: 'Claim nearby surplus hot meals with 1-click and receive volunteer delivery.',
      icon: Building2,
      color: 'blue',
      badge: 'Shelter Portal'
    },
    {
      id: 'VOLUNTEER' as UserRole,
      title: 'Volunteer Delivery Hero',
      subtitle: 'Express Delivery Riders, Logistics Volunteers & Bike Couriers',
      desc: 'Pick up hot surplus food from donor caterers and deliver safely to shelters.',
      icon: Bike,
      color: 'amber',
      badge: 'Delivery Dispatch'
    },
    {
      id: 'REQUESTER' as UserRole,
      title: 'Food Requester',
      subtitle: 'Community Organizations & Direct Meals Requesters',
      desc: 'Submit custom meal requests for immediate local partner matching.',
      icon: HeartHandshake,
      color: 'orange',
      badge: 'Direct Request'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div 
        id="role_selection_container"
        data-testid="role-selection-modal"
        className="relative w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-900 dark:text-white my-8"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
              STEP 2 OF 3: ROLE ASSIGNMENT
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as <strong className="text-slate-900 dark:text-white">{user.name}</strong></p>
        </div>

        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Select Your Primary Role
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            Choose how you wish to contribute to the AharSetu zero food waste network today. You can switch role views anytime in your profile menu.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;

            return (
              <div
                key={r.id}
                id={`role_card_${r.id.toLowerCase()}`}
                data-testid={`role-card-${r.id.toLowerCase()}`}
                onClick={() => setSelectedRole(r.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                    {r.badge}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{r.title}</h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-1.5">{r.subtitle}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Extra inputs based on role */}
        {selectedRole === 'NGO' && (
          <div className="mb-6 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shelter / NGO Primary Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="input_shelter_location"
                data-testid="input-shelter-location"
                key="input_shelter_location"
                type="text"
                placeholder="e.g. Lajpat Nagar IV, New Delhi"
                value={shelterLocation}
                onChange={(e) => setShelterLocation(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-9 pr-3 py-2 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          id="confirm_role_btn"
          data-testid="confirm-role-btn"
          onClick={handleConfirmRole}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{loading ? 'Assigning Role...' : 'Confirm Role & Go to Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
