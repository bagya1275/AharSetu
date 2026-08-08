import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Plus, Clock, Award, TrendingUp, PackageCheck, ShieldCheck, MapPin, AlertCircle, Utensils, Navigation, FileText } from 'lucide-react';
import { LiveTrackingModal } from './LiveTrackingModal.tsx';
import { DonationReceiptModal } from './DonationReceiptModal.tsx';

interface DonorDashboardProps {
  user: User;
  onOpenPostModal: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ user, onOpenPostModal }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'drafts'>('active');
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [trackingDonation, setTrackingDonation] = useState<Donation | null>(null);
  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);

  const fetchMyDonations = async () => {
    try {
      const res = await api.getMyDonations();
      if (res.success) {
        setMyDonations(res.donations || []);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const activePosts = myDonations.filter(d => d.status === 'AVAILABLE' || d.status === 'ACCEPTED' || d.status === 'IN_TRANSIT');
  const deliveredPosts = myDonations.filter(d => d.status === 'DELIVERED');

  const totalMeals = myDonations.reduce((acc, d) => acc + (d.servings || 0), 0);
  const totalWeight = myDonations.reduce((acc, d) => acc + (d.weightKg || 0), 0);
  const co2Saved = Math.round(totalWeight * 2.5);

  return (
    <div id="donor_dashboard" data-testid="donor-dashboard" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[11px] font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Hotel & Food Partner</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-emerald-100/80 text-xs leading-relaxed">
              Track your live surplus food posts, view real-time volunteer pickup routes, and download 80G impact receipts.
            </p>
          </div>

          <button
            id="post_surplus_food_btn"
            data-testid="post-surplus-food-btn"
            onClick={onOpenPostModal}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-400/20 flex items-center space-x-2 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post New Surplus Food</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Total Meals Saved</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalMeals} Meals</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Live Active Posts</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{activePosts.length} Posts</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">CO2 Prevented</p>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">~{co2Saved} kg</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Impact Badges</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">3 Badges Unlocked</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold space-x-2">
        <button
          id="tab_active_pickups"
          data-testid="tab-active-pickups"
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
            activeTab === 'active'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-t-lg'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Active Pickups ({activePosts.length})
        </button>
        <button
          id="tab_past_deliveries"
          data-testid="tab-past-deliveries"
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
            activeTab === 'past'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-t-lg'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Past Deliveries ({deliveredPosts.length})
        </button>
        <button
          id="tab_saved_drafts"
          data-testid="tab-saved-drafts"
          onClick={() => setActiveTab('drafts')}
          className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
            activeTab === 'drafts'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-t-lg'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Saved Drafts (0)
        </button>
      </div>

      {/* Main Content List / Empty State */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 min-h-[300px] shadow-sm">
        {loading ? (
          <p className="text-slate-500 dark:text-slate-400 text-xs text-center">Loading surplus posts...</p>
        ) : activeTab === 'active' && activePosts.length === 0 ? (
          <div className="space-y-3 max-w-sm py-8 mx-auto text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No active donations at the moment.</h3>
            <button
              id="empty_post_food_btn"
              data-testid="empty-post-food-btn"
              onClick={onOpenPostModal}
              className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>+ Post surplus food now</span>
            </button>
          </div>
        ) : activeTab === 'active' ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePosts.map((donation) => (
              <div 
                key={donation.id || donation._id} 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left space-y-3 hover:border-emerald-500/50 transition shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {donation.photoUrl ? (
                      <img src={donation.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{donation.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{donation.category} • {donation.dietary}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    donation.status === 'AVAILABLE' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                    donation.status === 'ACCEPTED' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30' :
                    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                  }`}>
                    {donation.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{donation.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>🍽️ {donation.servings} Servings ({donation.weightKg} kg)</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{donation.pickupAddress}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <button
                    onClick={() => setTrackingDonation(donation)}
                    className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Live GPS Map</span>
                  </button>

                  <button
                    onClick={() => setReceiptDonation(donation)}
                    className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>80G Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'past' && deliveredPosts.length > 0 ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveredPosts.map((donation) => (
              <div key={donation.id || donation._id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{donation.title}</h4>
                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">DELIVERED</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{donation.servings} Meals Delivered</p>
                <button
                  onClick={() => setReceiptDonation(donation)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download 80G Receipt</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-slate-500 dark:text-slate-400 text-xs text-center">
            No history in this tab yet.
          </div>
        )}
      </div>

      {/* Live GPS Tracking Modal */}
      <LiveTrackingModal
        isOpen={!!trackingDonation}
        onClose={() => setTrackingDonation(null)}
        donation={trackingDonation}
      />

      {/* 80G Tax Receipt Modal (Issue 1 second set Fix) */}
      <DonationReceiptModal
        isOpen={!!receiptDonation}
        onClose={() => setReceiptDonation(null)}
        donation={receiptDonation}
        user={user}
      />
    </div>
  );
};

