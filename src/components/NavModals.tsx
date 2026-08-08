import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, Award, Building } from 'lucide-react';
import { api } from '../services/api.ts';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 text-slate-900 dark:text-white shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Our Mission</h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Bridging India's Food Surplus to Zero Hunger Shelters</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Every single day in India, thousands of metric tons of perfectly safe, fresh cooked food from corporate events, banquets, hotels, and weddings go to waste — while millions of children and families in local shelters lack consistent meals.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">AharSetu ("Bridge of Nourishment")</strong> was built as a zero-friction, 100% non-monetary smart food redistribution ecosystem. By connecting surplus food generators directly with FSSAI-compliant NGOs and express volunteer logistics riders, we eliminate food waste in under 60 minutes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">60 Mins</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Average Express Pickup Time</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">100% Free</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Non-Monetary Redistribution</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">FSSAI</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Hygiene Inspection Standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImpactModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<{
    totalMealsRescued: number;
    co2PreventionKg: number;
    partnerHotelsCount: number;
    communitySheltersCount: number;
    completedDeliveriesCount: number;
    totalDonationsPosted: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getImpactStats()
        .then(res => {
          if (res.success && res.stats) {
            setStats(res.stats);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 text-slate-900 dark:text-white shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Live Platform Impact</h2>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Real-Time Database Statistics</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Fetching live platform data...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Surplus Meals Saved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.totalMealsRescued || 0} Meals
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Landfill CO2 Prevention</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                ~{stats?.co2PreventionKg || 0} kg
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified Partner Donors</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats?.partnerHotelsCount || 0} Partners
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Community Shelters & Requesters</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {stats?.communitySheltersCount || 0} Active
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          All metrics calculate live from registered user activities and completed food posts.
        </p>
      </div>
    </div>
  );
};

export const NGOsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [ngos, setNgos] = useState<Array<{
    id: string;
    name: string;
    location: string;
    mealsReceived: string;
    phone?: string;
    verifiedAt?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getVerifiedNGOs()
        .then(res => {
          if (res.success && Array.isArray(res.ngos)) {
            setNgos(res.ngos);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 text-slate-900 dark:text-white shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Verified NGOs & Shelters</h2>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Registered Non-Profit & Shelter Accounts</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading verified NGO database...</div>
        ) : ngos.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No registered shelters or NGOs found in database yet.
          </div>
        ) : (
          <div className="space-y-3 my-4 max-h-[350px] overflow-y-auto pr-1">
            {ngos.map((ngo) => (
              <div key={ngo.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{ngo.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">{ngo.location}</p>
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full text-[10px]">
                  {ngo.mealsReceived}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
