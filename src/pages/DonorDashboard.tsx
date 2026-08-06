import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { Donation } from '../types.js';
import { FoodCard } from '../components/FoodCard.js';
import { PdfReceiptModal } from '../components/PdfReceiptModal.js';
import { 
  PlusCircle, 
  Award, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  FileText, 
  FileCheck2, 
  Truck,
  Sparkles
} from 'lucide-react';

interface DonorDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDonation: (donation: Donation) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate, onSelectDonation }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'drafts'>('active');
  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyDonations = async () => {
      try {
        const res = await fetch(`/api/donations?donorId=${user?.id || 'usr_donor_1'}`);
        if (res.ok) {
          const data = await res.json();
          setDonations(data.donations || []);
        }
      } catch (err) {
        console.error('Fetch donor donations error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyDonations();
  }, [user]);

  const activeDonations = donations.filter(d => d.status === 'pending' || d.status === 'accepted' || d.status === 'assigned' || d.status === 'picked_up');
  const historyDonations = donations.filter(d => d.status === 'delivered' || d.status === 'cancelled');
  const draftDonations = donations.filter(d => d.status === 'draft');

  const totalMealsDonated = historyDonations.reduce((sum, d) => sum + d.quantityServings, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Donor Banner Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Hotel & Food Partner
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome, {user?.name || user?.organization || 'Food Partner'}
          </h1>
          {user?.organization && user?.organization !== user?.name && (
            <p className="text-xs text-emerald-200 font-semibold">
              Organization: {user.organization}
            </p>
          )}
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            Track your live surplus food posts, view real-time volunteer pickup routes, and download 80G impact receipts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('post-donation')}
          className="py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Surplus Food
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-md">
          <span className="text-xs text-slate-500 block">Total Meals Saved</span>
          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{totalMealsDonated} Meals</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-md">
          <span className="text-xs text-slate-500 block">Live Active Posts</span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{activeDonations.length} Posts</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-md">
          <span className="text-xs text-slate-500 block">CO2 Prevented</span>
          <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">~{Math.round(totalMealsDonated * 0.85)} kg</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-md">
          <span className="text-xs text-slate-500 block">Impact Badges</span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">3 Badges Unlocked</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Active Pickups ({activeDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Past Deliveries ({historyDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'drafts' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Saved Drafts ({draftDonations.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'active' && (
          activeDonations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active donations at the moment.</p>
              <button
                onClick={() => onNavigate('post-donation')}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
              >
                + Post surplus food now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDonations.map(d => (
                <FoodCard
                  key={d.id}
                  donation={d}
                  onSelect={onSelectDonation}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'history' && (
          historyDonations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No completed deliveries yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyDonations.map(d => (
                <FoodCard
                  key={d.id}
                  donation={d}
                  onSelect={onSelectDonation}
                  onPdfReceipt={donation => setReceiptDonation(donation)}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'drafts' && (
          draftDonations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No drafts saved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftDonations.map(d => (
                <FoodCard
                  key={d.id}
                  donation={d}
                  onSelect={onSelectDonation}
                />
              ))}
            </div>
          )
        )}
      </div>

      <PdfReceiptModal
        donation={receiptDonation}
        onClose={() => setReceiptDonation(null)}
      />

    </div>
  );
};
